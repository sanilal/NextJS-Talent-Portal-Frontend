'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';
import { projectsAPI } from '@/lib/api/projects';
import { applicationsAPI } from '@/lib/api/applications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const applicationSchema = z.object({
  cover_letter: z.string().min(100, 'Cover letter must be at least 100 characters'),
  proposed_rate: z.number().min(0).optional(),
  proposed_duration: z.number().min(1).optional(),
  availability_date: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplyToProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const projectId = parseInt(resolvedParams.id);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getProject(projectId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: (data: ApplicationFormValues) => 
      applicationsAPI.apply({
        project_id: projectId,
        ...data,
      }),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      router.push('/dashboard/applications');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    applyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Project not found
        </h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Apply to Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter *</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  {...register('cover_letter')}
                  rows={12}
                  placeholder="Explain why you're the perfect fit for this project. Highlight your relevant experience and skills..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.cover_letter && (
                  <p className="mt-1 text-sm text-red-600">{errors.cover_letter.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Minimum 100 characters required
                </p>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proposed Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Proposed Rate (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      {...register('proposed_rate', { valueAsNumber: true })}
                      type="number"
                      placeholder="0.00"
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Proposed Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Duration (Days)
                  </label>
                  <input
                    {...register('proposed_duration', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g., 30"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Availability Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    When Can You Start?
                  </label>
                  <input
                    {...register('availability_date')}
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                isLoading={applyMutation.isPending}
                disabled={applyMutation.isPending}
              >
                <Send className="h-5 w-5 mr-2" />
                Submit Application
              </Button>
            </div>
          </form>
        </div>

        {/* Project Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${project.budget_min} - ${project.budget_max}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {project.experience_level}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {project.project_type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {project.is_remote ? 'Remote' : project.location}
                  </span>
                </div>
              </div>

              {project.skills && project.skills.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}