'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { projectsAPI } from '@/lib/api/projects';
import api from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ProjectFormData, Skill, ProjectType } from '@/types';

const projectSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  project_type_id: z.number().min(1, 'Please select a project type'),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  budget_currency: z.string().default('AED'),
  budget_type: z.enum(['fixed', 'hourly', 'daily', 'negotiable']).optional(),
  duration: z.number().min(1).optional(),
  location: z.string().optional(),
  work_type: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  experience_level: z.enum(['entry', 'intermediate', 'advanced', 'expert']).optional(),
  application_deadline: z.string().optional(),
  project_start_date: z.string().optional(),
  project_end_date: z.string().optional(),
  primary_category_id: z.string().optional(), // UUID for talent category
  skills_required: z.array(z.string()).optional(), // Array of skill UUIDs
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  deliverables: z.string().optional(),
  positions_available: z.number().min(1).optional(),
  visibility: z.enum(['public', 'private', 'invited_only']).optional(),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  is_featured: z.boolean().optional(),
  requires_portfolio: z.boolean().optional(),
  requires_demo_reel: z.boolean().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch skills
  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await api.get('/public/skills');
      return response.data;
    },
  });

  // Fetch project types
  const { data: projectTypesData, isLoading: projectTypesLoading } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: async () => {
      const response = await api.get('/public/project-types');
      return response.data;
    },
  });

  // Fetch categories (optional - for primary_category_id)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/public/categories');
      return response.data;
      
    },
  });

  const skills = skillsData?.data || [];
  const projectTypes = projectTypesData?.data || [];
  
  // Extract categories with their subcategories
  const categories = React.useMemo(() => {
    if (!categoriesData?.data) return [];
    
    return categoriesData.data.map((item: any) => {
      const category = item.category || item;
      return {
        id: category.id,
        name: category.categoryName || category.name,
        icon: category.icon,
      };
    });
  }, [categoriesData]);

  
      

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      budget_currency: 'AED',
      work_type: 'on_site',
      experience_level: 'intermediate',
      budget_type: 'fixed',
      visibility: 'public',
      urgency: 'normal',
      positions_available: 1,
      is_featured: false,
      requires_portfolio: false,
      requires_demo_reel: false,
    },
  });

  // ✅ FIXED: Create project mutation now calls /recruiter/projects
  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectsAPI.createProject(data),
    onSuccess: (response) => {
      console.log('Project created successfully:', response);
      toast.success('Project created successfully!');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['recruiterProjects'] });
      
      // Redirect - handle both data structures
      const projectId = response.data?.id || response.id;
      if (projectId) {
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        router.push('/dashboard/projects');
      }
    },
    onError: (error: any) => {
      console.error('📋 Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        // 🔍 LOG EACH VALIDATION ERROR
        console.error('🚫 Validation Errors:', errors);
        Object.entries(errors).forEach(([field, messages]) => {
          console.error(`  - ${field}:`, messages);
          toast.error(`${field}: ${(messages as string[]).join(', ')}`);
        });
      } else {
        const message = error.response?.data?.message || 'Failed to create project';
        toast.error(message);
      }
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    console.log('📤 SUBMITTING PROJECT DATA:', JSON.stringify(data, null, 2));
    console.log('📋 Data Types:', {
      project_type_id: typeof data.project_type_id,
      primary_category_id: typeof data.primary_category_id,
      budget_min: typeof data.budget_min,
    });
    
    try {
      await createMutation.mutateAsync(data as ProjectFormData);
    } catch (error) {
      // Error already handled in onError callback
      console.error('Submit error:', error);
    }
  };

  const workType = watch('work_type');
  const budgetType = watch('budget_type');

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={createMutation.isPending}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Project
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details below to post your project
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g., Lead Actor for Feature Film Drama"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Provide detailed information about the project, requirements, and expectations..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Type *
              </label>
              <select
                {...register('project_type_id', { valueAsNumber: true })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={projectTypesLoading}
              >
                <option value="">
                  {projectTypesLoading ? 'Loading project types...' : 'Select a project type'}
                </option>
                {projectTypes.map((type: ProjectType) => (
                  <option key={type.id} value={type.id}>
                    {type.icon && `${type.icon} `}{type.name}
                  </option>
                ))}
              </select>
              {errors.project_type_id && (
                <p className="mt-1 text-sm text-red-600">{errors.project_type_id.message}</p>
              )}
            </div>

            {/* Talent Category - Main Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Talent Category 
                  </label>
                  <select
                    {...register('primary_category_id')}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">No specific category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the main talent category
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Specify work type, location, and timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience Level
                </label>
                <select
                  {...register('experience_level')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Type
                </label>
                <select
                  {...register('work_type')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="on_site">On-Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Location */}
            {workType !== 'remote' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location {workType === 'on_site' && '*'}
                </label>
                <input
                  type="text"
                  {...register('location')}
                  placeholder="e.g., Dubai Media City, UAE"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget Range
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  {...register('budget_min', { valueAsNumber: true })}
                  placeholder="Min"
                  disabled={budgetType === 'negotiable'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <input
                  type="number"
                  {...register('budget_max', { valueAsNumber: true })}
                  placeholder="Max"
                  disabled={budgetType === 'negotiable'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <select
                  {...register('budget_currency')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SAR">SAR</option>
                  <option value="QAR">QAR</option>
                </select>
              </div>
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget Type
              </label>
              <select
                {...register('budget_type')}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="daily">Daily Rate</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            {/* Duration & Positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (in days)
                </label>
                <input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="e.g., 30"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Positions Available
                </label>
                <input
                  type="number"
                  {...register('positions_available', { valueAsNumber: true })}
                  min="1"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Start Date
                </label>
                <input
                  type="date"
                  {...register('project_start_date')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  {...register('application_deadline')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Urgency & Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Urgency
                </label>
                <select
                  {...register('urgency')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <select
                  {...register('visibility')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="invited_only">Invited Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
            <CardDescription>Select the skills needed for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Skills
              </label>
              {skillsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading skills...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                  {skills.map((skill: Skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={skill.id}
                        {...register('skills_required')}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {skill.icon && `${skill.icon} `}{skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Provide more context about the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requirements
              </label>
              <textarea
                {...register('requirements')}
                rows={4}
                placeholder="List specific requirements for applicants..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsibilities
              </label>
              <textarea
                {...register('responsibilities')}
                rows={4}
                placeholder="Describe what the talent will be responsible for..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deliverables
              </label>
              <textarea
                {...register('deliverables')}
                rows={4}
                placeholder="What should be delivered at the end of the project..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Application Requirements */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Application Requirements
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('requires_portfolio')}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require Portfolio
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('requires_demo_reel')}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require Demo Reel
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Feature this project (if available)
                  </span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || isSubmitting}
            className="min-w-[150px]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}