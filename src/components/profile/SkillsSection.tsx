'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { talentsAPI } from '@/lib/api/talents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TalentSkill, Skill } from '@/types';

// ✅ Define the proficiency type
type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface SkillsSectionProps {
  skills?: TalentSkill[];
  allSkills: Skill[];
}

export function SkillsSection({ skills = [], allSkills }: SkillsSectionProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  // ✅ FIXED: Type proficiency as union type, not string
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(1);

  // Add skill mutation
  const addMutation = useMutation({
    // ✅ FIXED: Type the data parameter with proper proficiency_level type
    mutationFn: (data: { 
      skill_id: number; 
      proficiency_level: ProficiencyLevel; 
      years_of_experience: number 
    }) => talentsAPI.addSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Skill added successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to add skill');
    },
  });

  // Update skill mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TalentSkill> }) =>
      talentsAPI.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Skill updated successfully');
      setEditingId(null);
    },
    onError: () => {
      toast.error('Failed to update skill');
    },
  });

  // Delete skill mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => talentsAPI.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Skill removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove skill');
    },
  });

  const resetForm = () => {
    setIsAdding(false);
    setSelectedSkillId(null);
    setProficiency('intermediate');
    setYearsOfExperience(1);
  };

  const handleAdd = () => {
    if (!selectedSkillId) {
      toast.error('Please select a skill');
      return;
    }

    addMutation.mutate({
      skill_id: selectedSkillId,
      proficiency_level: proficiency,
      years_of_experience: yearsOfExperience,
    });
  };

  const handleUpdate = (skillId: number) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    updateMutation.mutate({
      id: skillId,
      data: {
        proficiency_level: proficiency,
        years_of_experience: yearsOfExperience,
      },
    });
  };

  const getProficiencyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      advanced: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      expert: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return colors[level] || colors.intermediate;
  };

  // Filter out already added skills
  const availableSkills = allSkills.filter(
    skill => !skills.some(s => s.skill_id === skill.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Skill Form */}
        {isAdding && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Skill
              </label>
              <select
                value={selectedSkillId || ''}
                onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a skill...</option>
                {availableSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proficiency
                </label>
                <select
                  value={proficiency}
                  // ✅ FIXED: Cast to ProficiencyLevel
                  onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={addMutation.isPending || !selectedSkillId}
              >
                <Check className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            </div>
          </div>
        )}

        {/* Skills List */}
        {skills.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              No skills added yet
            </p>
            {!isAdding && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                Add Your First Skill
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((talentSkill) => (
              <div
                key={talentSkill.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {editingId === talentSkill.id ? (
                  // Edit Mode
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {talentSkill.skill?.name}
                      </p>
                    </div>
                    <select
                      value={proficiency}
                      // ✅ FIXED: Cast to ProficiencyLevel
                      onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                ) : (
                  // View Mode
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {talentSkill.skill?.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getProficiencyColor(talentSkill.proficiency_level)}`}>
                        {talentSkill.proficiency_level}
                      </span>
                      {talentSkill.years_of_experience && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {talentSkill.years_of_experience} {talentSkill.years_of_experience === 1 ? 'year' : 'years'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {editingId === talentSkill.id ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setProficiency('intermediate');
                          setYearsOfExperience(1);
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdate(talentSkill.id)}
                        className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                        aria-label="Save changes"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(talentSkill.id);
                          setProficiency(talentSkill.proficiency_level);
                          setYearsOfExperience(talentSkill.years_of_experience || 1);
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label="Edit skill"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this skill?')) {
                            deleteMutation.mutate(talentSkill.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        aria-label="Delete skill"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
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