'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api/axios';

interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export default function ExperienceEducationPage() {
  const [activeTab, setActiveTab] = useState<'experience' | 'education'>('experience');
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  // Fetch experiences
  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      const response = await api.get('/talent/experiences');
      return response.data || [];
    },
  });

  // Fetch education
  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ['education'],
    queryFn: async () => {
      const response = await api.get('/talent/education');
      return response.data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Experience & Education
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add your work history and education
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'experience'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            Work Experience
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'education'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            Education
          </button>
        </nav>
      </div>

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowExpModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Experience
            </Button>
          </div>

          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {exp.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                        {exp.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {exp.location}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                          {exp.is_current ? 'Present' : new Date(exp.end_date!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingExp(exp);
                            setShowExpModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteExperience id={exp.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No work experience added
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add your work history to strengthen your profile
                </p>
                <Button onClick={() => setShowExpModal(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowEduModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Education
            </Button>
          </div>

          {education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <Card key={edu.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                        {edu.field_of_study && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {edu.field_of_study}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                          {edu.is_current ? 'Present' : new Date(edu.end_date!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                            {edu.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEdu(edu);
                            setShowEduModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteEducation id={edu.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No education added
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add your educational background
                </p>
                <Button onClick={() => setShowEduModal(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      {showExpModal && (
        <ExperienceModal
          experience={editingExp}
          onClose={() => {
            setShowExpModal(false);
            setEditingExp(null);
          }}
        />
      )}

      {showEduModal && (
        <EducationModal
          education={editingEdu}
          onClose={() => {
            setShowEduModal(false);
            setEditingEdu(null);
          }}
        />
      )}
    </div>
  );
}

// Experience Modal
function ExperienceModal({ experience, onClose }: { experience: Experience | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company: experience?.company || '',
    location: experience?.location || '',
    start_date: experience?.start_date || '',
    end_date: experience?.end_date || '',
    is_current: experience?.is_current || false,
    description: experience?.description || '',
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (experience) {
        return api.put(`/talent/experiences/${experience.id}`, data);
      }
      return api.post('/talent/experiences', data);
    },
    onSuccess: () => {
      toast.success(experience ? 'Experience updated' : 'Experience added');
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      onClose();
    },
    onError: () => toast.error('Failed to save experience'),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {experience ? 'Edit Experience' : 'Add Experience'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                I currently work here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {experience ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Education Modal
function EducationModal({ education, onClose }: { education: Education | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    degree: education?.degree || '',
    institution: education?.institution || '',
    field_of_study: education?.field_of_study || '',
    start_date: education?.start_date || '',
    end_date: education?.end_date || '',
    is_current: education?.is_current || false,
    description: education?.description || '',
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (education) {
        return api.put(`/talent/education/${education.id}`, data);
      }
      return api.post('/talent/education', data);
    },
    onSuccess: () => {
      toast.success(education ? 'Education updated' : 'Education added');
      queryClient.invalidateQueries({ queryKey: ['education'] });
      onClose();
    },
    onError: () => toast.error('Failed to save education'),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {education ? 'Edit Education' : 'Add Education'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Degree *
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="e.g., Bachelor of Arts"
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution *
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field of Study
              </label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                placeholder="e.g., Performing Arts"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked, end_date: e.target.checked ? '' : formData.end_date })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Currently studying
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Achievements, activities, etc."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {education ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Components
function DeleteExperience({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/talent/experiences/${id}`),
    onSuccess: () => {
      toast.success('Experience deleted');
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (confirm('Delete this experience?')) {
          deleteMutation.mutate();
        }
      }}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </Button>
  );
}

function DeleteEducation({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/talent/education/${id}`),
    onSuccess: () => {
      toast.success('Education deleted');
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (confirm('Delete this education?')) {
          deleteMutation.mutate();
        }
      }}
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </Button>
  );
}