'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { talentsAPI } from '@/lib/api/talents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Education } from '@/types';

const educationSchema = z.object({
  degree: z.string().min(2, 'Degree is required'),
  field_of_study: z.string().min(2, 'Field of study is required'),
  institution: z.string().min(2, 'Institution is required'),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  description: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationSchema>;

interface EducationSectionProps {
  education?: Education[];
}

export function EducationSection({ education = [] }: EducationSectionProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
  });

  // Add education mutation
  const addMutation = useMutation({
    mutationFn: (data: EducationFormValues) => talentsAPI.addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Education added successfully');
      reset();
      setIsAdding(false);
    },
    onError: () => {
      toast.error('Failed to add education');
    },
  });

  // Update education mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EducationFormValues }) =>
      talentsAPI.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Education updated successfully');
      reset();
      setEditingId(null);
    },
    onError: () => {
      toast.error('Failed to update education');
    },
  });

  // Delete education mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsAPI.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Education removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove education');
    },
  });

  const onSubmit = (data: EducationFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const startEdit = (edu: Education) => {
    setEditingId(edu.id);
    setIsAdding(true);
    reset({
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      institution: edu.institution,
      location: edu.location || '',
      start_date: edu.start_date,
      end_date: edu.end_date || '',
      description: edu.description || '',
    });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Education</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {isAdding && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            {/* Degree & Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Degree *
                </label>
                <input
                  {...register('degree')}
                  type="text"
                  placeholder="e.g., Bachelor of Science"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.degree && (
                  <p className="mt-1 text-sm text-red-600">{errors.degree.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Study *
                </label>
                <input
                  {...register('field_of_study')}
                  type="text"
                  placeholder="e.g., Computer Science"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.field_of_study && (
                  <p className="mt-1 text-sm text-red-600">{errors.field_of_study.message}</p>
                )}
              </div>
            </div>

            {/* Institution & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution *
                </label>
                <input
                  {...register('institution')}
                  type="text"
                  placeholder="e.g., Stanford University"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.institution && (
                  <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  {...register('location')}
                  type="text"
                  placeholder="e.g., Stanford, CA"
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
                  End Date (or Expected)
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Activities, achievements, honors..."
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
                isLoading={addMutation.isPending || updateMutation.isPending}
              >
                {editingId ? 'Update' : 'Add'} Education
              </Button>
            </div>
          </form>
        )}

        {/* Education List */}
        {education.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No education added yet
            </p>
            {!isAdding && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                Add Your First Education
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {/* Icon */}
                <div className="flex-shrink-0 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {edu.degree}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {edu.field_of_study}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.institution}
                        {edu.location && ` • ${edu.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(edu)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this education?')) {
                            deleteMutation.mutate(edu.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date Range */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {formatDate(edu.start_date, 'MMM yyyy')} -{' '}
                    {edu.end_date ? formatDate(edu.end_date, 'MMM yyyy') : 'Present'}
                  </p>

                  {/* Description */}
                  {edu.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                      {edu.description}
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