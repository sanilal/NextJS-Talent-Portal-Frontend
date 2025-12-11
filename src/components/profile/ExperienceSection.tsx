'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { talentsAPI } from '@/lib/api/talents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Experience } from '@/types';

// ✅ CORRECT FIX: is_current must be REQUIRED boolean, not optional
const experienceSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  company: z.string().min(2, 'Company is required'),
  location: z.string().optional(),
  is_current: z.boolean(), // ✅ Required boolean - NO .default(), NO .optional()
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  // If not current position, end_date is required
  if (!data.is_current && !data.end_date) {
    return false;
  }
  return true;
}, {
  message: "End date is required if not current position",
  path: ["end_date"],
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceSectionProps {
  experiences?: Experience[];
}

export function ExperienceSection({ experiences = [] }: ExperienceSectionProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    // ✅ Set default value for is_current in defaultValues
    defaultValues: {
      is_current: false,
      location: '',
      description: '',
    },
  });

  const isCurrent = watch('is_current');

  // Add experience mutation
  const addMutation = useMutation({
    mutationFn: (data: ExperienceFormValues) => talentsAPI.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Experience added successfully');
      reset({
        is_current: false,
        location: '',
        description: '',
      });
      setIsAdding(false);
    },
    onError: () => {
      toast.error('Failed to add experience');
    },
  });

  // Update experience mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExperienceFormValues }) =>
      talentsAPI.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Experience updated successfully');
      reset({
        is_current: false,
        location: '',
        description: '',
      });
      setEditingId(null);
    },
    onError: () => {
      toast.error('Failed to update experience');
    },
  });

  // Delete experience mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsAPI.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Experience removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove experience');
    },
  });

  const onSubmit = (data: ExperienceFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const startEdit = (experience: Experience) => {
    setEditingId(experience.id);
    setIsAdding(true);
    reset({
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      is_current: experience.is_current,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      description: experience.description || '',
    });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({
      is_current: false,
      location: '',
      description: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g., Senior Developer"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Company & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company *
                </label>
                <input
                  {...register('company')}
                  type="text"
                  placeholder="e.g., Google"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  placeholder="e.g., San Francisco, CA"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  {...register('start_date')}
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date {!isCurrent && '*'}
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  disabled={isCurrent}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Current Position */}
            <div className="flex items-center gap-2">
              <input
                {...register('is_current')}
                type="checkbox"
                id="is_current"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_current" className="text-sm text-gray-700 dark:text-gray-300">
                I currently work here
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your responsibilities and achievements..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {editingId ? 'Update' : 'Add'} Experience
              </Button>
            </div>
          </form>
        )}

        {/* Experience List */}
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No work experience added yet
            </p>
            {!isAdding && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                Add Your First Experience
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="relative pl-8 pb-4 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0 last:pb-0"
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-gray-900"></div>

                {/* Content */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {exp.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(exp)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label="Edit experience"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this experience?')) {
                            deleteMutation.mutate(exp.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        aria-label="Delete experience"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>{formatDate(exp.start_date, 'MMM yyyy')}</span>
                    <span>-</span>
                    <span>
                      {exp.is_current ? 'Present' : formatDate(exp.end_date!, 'MMM yyyy')}
                    </span>
                    {exp.is_current && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {exp.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}