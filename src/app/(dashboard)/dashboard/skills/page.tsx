'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, Video, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api/axios';

interface Skill {
  id: number;
  name: string;
  category_id: number;
}

interface TalentSkill {
  id: number;
  skill_id: number;
  skill: Skill;
  description?: string;
  proficiency_level?: string;
  years_of_experience?: number;
  image_url?: string;
  video_url?: string;
  is_primary?: boolean;
  display_order?: number;
}

export default function SkillsManagementPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TalentSkill | null>(null);

  // Fetch user's skills
  const { data: talentSkills = [], isLoading } = useQuery<TalentSkill[]>({
    queryKey: ['talent-skills'],
    queryFn: async () => {
      const response = await api.get('/talent/skills');
      return response.data || [];
    },
  });

  // Fetch all available skills
  const { data: availableSkills = [] } = useQuery<Skill[]>({
    queryKey: ['all-skills'],
    queryFn: async () => {
      const response = await api.get('/public/skills');
      return response.data || [];
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/talent/skills/${id}`),
    onSuccess: () => {
      toast.success('Skill removed successfully');
      queryClient.invalidateQueries({ queryKey: ['talent-skills'] });
    },
    onError: () => {
      toast.error('Failed to remove skill');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Skills
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your skills and expertise
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : talentSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talentSkills.map((talentSkill) => (
            <Card key={talentSkill.id} className="relative">
              {talentSkill.is_primary && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Primary
                  </span>
                </div>
              )}
              
              <CardContent className="p-6">
                {/* Skill Image */}
                {talentSkill.image_url && (
                  <div className="mb-4">
                    <img
                      src={talentSkill.image_url}
                      alt={talentSkill.skill.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Skill Info */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {talentSkill.skill.name}
                </h3>

                {talentSkill.proficiency_level && (
                  <div className="mb-2">
                    <span className={`
                      inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${talentSkill.proficiency_level === 'expert' ? 'bg-green-100 text-green-800' :
                        talentSkill.proficiency_level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        talentSkill.proficiency_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {talentSkill.proficiency_level}
                    </span>
                  </div>
                )}

                {talentSkill.years_of_experience && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {talentSkill.years_of_experience} years experience
                  </p>
                )}

                {talentSkill.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {talentSkill.description}
                  </p>
                )}

                {/* Media Links */}
                <div className="flex gap-2 mb-4">
                  {talentSkill.image_url && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Image
                    </span>
                  )}
                  {talentSkill.video_url && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSkill(talentSkill)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Remove this skill?')) {
                        deleteSkillMutation.mutate(talentSkill.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No skills added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start building your profile by adding your skills
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingSkill) && (
        <SkillModal
          skill={editingSkill}
          availableSkills={availableSkills}
          onClose={() => {
            setShowAddModal(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}

// Skill Modal Component
function SkillModal({ 
  skill, 
  availableSkills, 
  onClose 
}: { 
  skill: TalentSkill | null; 
  availableSkills: Skill[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    skill_id: skill?.skill_id || '',
    description: skill?.description || '',
    proficiency_level: skill?.proficiency_level || 'intermediate',
    years_of_experience: skill?.years_of_experience || 0,
    video_url: skill?.video_url || '',
    is_primary: skill?.is_primary || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(skill?.image_url || null);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (skill) {
        return api.post(`/talent/skills/${skill.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return api.post('/talent/skills', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      toast.success(skill ? 'Skill updated successfully' : 'Skill added successfully');
      queryClient.invalidateQueries({ queryKey: ['talent-skills'] });
      onClose();
    },
    onError: () => {
      toast.error('Failed to save skill');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        data.append(key, value.toString());
      }
    });
    if (imageFile) {
      data.append('image', imageFile);
    }
    if (skill) {
      data.append('_method', 'PUT');
    }
    saveMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {skill ? 'Edit Skill' : 'Add New Skill'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Skill Selection */}
            {!skill && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Skill *
                </label>
                <select
                  value={formData.skill_id}
                  onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a skill...</option>
                  {availableSkills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your experience with this skill..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Proficiency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency Level
              </label>
              <select
                value={formData.proficiency_level}
                onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Showcase Image
              </label>
              {imagePreview && (
                <div className="mb-2">
                  <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Demo Video URL (optional)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Primary Skill Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Set as primary skill
              </label>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {skill ? 'Update' : 'Add'} Skill
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}