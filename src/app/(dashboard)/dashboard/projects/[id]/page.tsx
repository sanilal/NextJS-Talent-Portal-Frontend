'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Briefcase,
  User,
  Mail,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { projectsAPI } from '@/lib/api/projects';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Project } from '@/types';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const projectId = parseInt(resolvedParams.id);

  // Fetch project details
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getProject(projectId),
  });

  // Check if user has already applied
  const { data: hasApplied } = useQuery({
    queryKey: ['has-applied', projectId],
    queryFn: async () => {
      if (user?.user_type !== 'talent') return false;
      const response = await api.get(`/talent/applications?project_id=${projectId}`);
      return response.data.data.length > 0;
    },
    enabled: !!user && user.user_type === 'talent',
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectsAPI.deleteProject(projectId),
    onSuccess: () => {
      toast.success('Project deleted successfully');
      router.push('/dashboard/projects');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate();
    }
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
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === project.recruiter_id;
  const isTalent = user?.user_type === 'talent';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            <span className={`
              px-3 py-1 text-sm font-medium rounded-full
              ${project.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
              ${project.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
              ${project.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            `}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Posted {formatDate(project.created_at, 'PPP')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/projects/edit/${project.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {isTalent && !hasApplied && project.status === 'published' && (
            <Button
              size="lg"
              onClick={() => router.push(`/dashboard/projects/${project.id}/apply`)}
            >
              Apply Now
            </Button>
          )}

          {isTalent && hasApplied && (
            <Button size="lg" disabled>
              Already Applied
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{project.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1.5 text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget */}
              {project.budget_min && project.budget_max && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Budget
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(project.budget_min, project.budget_currency)} - {formatCurrency(project.budget_max, project.budget_currency)}
                    </p>
                  </div>
                </div>
              )}

              {/* Project Type */}
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Project Type
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {project.project_type}
                  </p>
                </div>
              </div>

              {/* Experience Level */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Experience Level
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {project.experience_level}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Location
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.is_remote ? 'Remote' : project.location || 'On-site'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              {project.duration && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Duration
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {project.duration} {project.duration_unit}
                    </p>
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {project.application_deadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Application Deadline
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(project.application_deadline, 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recruiter Info */}
          {project.recruiter && (
            <Card>
              <CardHeader>
                <CardTitle>Posted By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {project.recruiter.first_name?.charAt(0)}{project.recruiter.last_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {project.recruiter.first_name} {project.recruiter.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recruiter
                    </p>
                  </div>
                </div>
                {!isOwner && (
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Recruiter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Applications
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.applications_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Views
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.views_count || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}