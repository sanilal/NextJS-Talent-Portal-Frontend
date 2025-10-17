'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, Video, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api/axios';

interface Skill {
  id: number;
  name: string;
  category_id: number;
}

interface TalentSkill {
  id: number;
  talent_profile_id: number;
  skill_id: number;
  skill: Skill;
  description?: string;
  proficiency_level?: number; // Integer: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
  years_of_experience?: number;
  image_url?: string;
  video_url?: string;
  is_primary?: boolean;
  display_order?: number;
}

// Proficiency level mapping (Integer keys)
const PROFICIENCY_LEVELS = {
  1: { label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
  2: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'Advanced', color: 'bg-blue-100 text-blue-800' },
  4: { label: 'Expert', color: 'bg-green-100 text-green-800' },
};

export default function SkillsManagementPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TalentSkill | null>(null);

  // Fetch user's skills
  const { data: talentSkills = [], isLoading } = useQuery<TalentSkill[]>({
    queryKey: ['talent-skills'],
    queryFn: async () => {
      const response = await api.get('/talent/skills');
      console.log('👤 Talent skills response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    },
  });

  // Fetch all available skills
  const { data: availableSkills = [], isLoading: isLoadingSkills, error: skillsError } = useQuery<Skill[]>({
    queryKey: ['all-skills'],
    queryFn: async () => {
      try {
        const response = await api.get('/public/skills');
        console.log('🔍 Available skills response:', response.data);
        
        let skills: Skill[] = [];
        
        if (Array.isArray(response.data)) {
          skills = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          skills = response.data.data;
        } else if (response.data?.skills && Array.isArray(response.data.skills)) {
          skills = response.data.skills;
        } else {
          console.warn('⚠️ Unexpected skills response structure:', response.data);
          return [];
        }
        
        console.log('✅ Parsed skills:', skills.length, 'skills found');
        return skills;
      } catch (error) {
        console.error('❌ Error fetching skills:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
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

  const handleAddClick = () => {
    console.log('Add Skill button clicked');
    console.log('Available skills:', availableSkills);
    
    if (!availableSkills || availableSkills.length === 0) {
      toast.error('No skills available. Please check your connection.');
      return;
    }
    
    setShowAddModal(true);
  };

  if (skillsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Skills
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your skills and expertise
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to Load Skills
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an error loading available skills. Please check your connection.
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['all-skills'] })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <button
          onClick={handleAddClick}
          disabled={isLoadingSkills}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          {isLoadingSkills ? 'Loading...' : 'Add Skill'}
        </button>
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
                {talentSkill.image_url && (
                  <div className="mb-4">
                    <img
                      src={talentSkill.image_url}
                      alt={talentSkill.skill.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {talentSkill.skill.name}
                </h3>

                {talentSkill.proficiency_level && PROFICIENCY_LEVELS[talentSkill.proficiency_level as keyof typeof PROFICIENCY_LEVELS] && (
                  <div className="mb-2">
                    <span className={`
                      inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${PROFICIENCY_LEVELS[talentSkill.proficiency_level as keyof typeof PROFICIENCY_LEVELS].color}
                    `}>
                      {PROFICIENCY_LEVELS[talentSkill.proficiency_level as keyof typeof PROFICIENCY_LEVELS].label}
                    </span>
                  </div>
                )}

                {talentSkill.years_of_experience !== undefined && talentSkill.years_of_experience > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {talentSkill.years_of_experience} years experience
                  </p>
                )}

                {talentSkill.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {talentSkill.description}
                  </p>
                )}

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

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSkill(talentSkill)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Remove this skill?')) {
                        deleteSkillMutation.mutate(talentSkill.id);
                      }
                    }}
                    className="px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
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
            <button
              onClick={handleAddClick}
              disabled={isLoadingSkills}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              {isLoadingSkills ? 'Loading Skills...' : 'Add Your First Skill'}
            </button>
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
    proficiency_level: skill?.proficiency_level || 2, // Default: 2 = Intermediate
    years_of_experience: skill?.years_of_experience || 0,
    video_url: skill?.video_url || '',
    is_primary: skill?.is_primary || false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(skill?.image_url || null);

  console.log('SkillModal rendered with:', {
    isEdit: !!skill,
    availableSkillsCount: availableSkills?.length || 0,
    formData
  });

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log('📤 Sending form data:');
      for (const [key, value] of data.entries()) {
        console.log(`  ${key}:`, value);
      }

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
    onSuccess: (response) => {
      console.log('✅ Skill saved successfully:', response.data);
      toast.success(skill ? 'Skill updated successfully' : 'Skill added successfully');
      queryClient.invalidateQueries({ queryKey: ['talent-skills'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Save skill error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.error('🔴 Validation errors:', errors);
        
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0] as string);
        } else {
          toast.error('Validation failed. Check console for details.');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to save skill');
      }
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
    
    console.log('🚀 Submitting skill with formData:', formData);
    console.log('🔍 Proficiency level type:', typeof formData.proficiency_level);
    console.log('🔍 Proficiency level value:', formData.proficiency_level);
    
    const data = new FormData();
    
    // Add skill_id (REQUIRED)
    if (formData.skill_id) {
      data.append('skill_id', formData.skill_id.toString());
    }
    
    // Add description (optional)
    if (formData.description && formData.description.trim()) {
      data.append('description', formData.description.trim());
    }
    
    // Add proficiency_level as INTEGER (REQUIRED)
    if (formData.proficiency_level) {
      data.append('proficiency_level', formData.proficiency_level.toString());
      console.log('✅ Added proficiency_level:', formData.proficiency_level, '(type: number)');
    } else {
      console.error('❌ proficiency_level is missing!');
    }
    
    // Add years_of_experience
    if (formData.years_of_experience !== undefined && formData.years_of_experience !== null) {
      data.append('years_of_experience', formData.years_of_experience.toString());
    }
    
    // Add video_url (optional)
    if (formData.video_url && formData.video_url.trim()) {
      data.append('video_url', formData.video_url.trim());
    }
    
    // Add is_primary as boolean (0 or 1)
    data.append('is_primary', formData.is_primary ? '1' : '0');
    
    // Add image file if selected
    if (imageFile) {
      data.append('image', imageFile);
    }
    
    // For updates, add _method field
    if (skill) {
      data.append('_method', 'PUT');
    }
    
    console.log('📦 FormData contents being sent:');
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, `[File: ${value.name}]`);
      } else {
        console.log(`  ${key}:`, value, `(type: ${typeof value})`);
      }
    }
    
    saveMutation.mutate(data);
  };

  const skillsList = Array.isArray(availableSkills) ? availableSkills : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                  Select Skill * {skillsList.length === 0 && <span className="text-red-500 text-xs">(No skills available)</span>}
                </label>
                <select
                  value={formData.skill_id}
                  onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                  required
                  disabled={skillsList.length === 0}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Choose a skill...</option>
                  {skillsList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {skillsList.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    Unable to load skills. Please refresh the page.
                  </p>
                )}
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

            {/* Proficiency Level - AS INTEGER */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency Level *
              </label>
              <select
                value={formData.proficiency_level}
                onChange={(e) => setFormData({ ...formData, proficiency_level: parseInt(e.target.value) })}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">Beginner</option>
                <option value="2">Intermediate</option>
                <option value="3">Advanced</option>
                <option value="4">Expert</option>
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
                max="50"
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
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Max 2MB. Supported: JPG, PNG, GIF
              </p>
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
                placeholder="https://youtube.com/watch?v=..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Primary Skill Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_primary" className="text-sm text-gray-700 dark:text-gray-300">
                Set as primary skill
              </label>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saveMutation.isPending}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending || (skillsList.length === 0 && !skill)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? 'Saving...' : skill ? 'Update Skill' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}