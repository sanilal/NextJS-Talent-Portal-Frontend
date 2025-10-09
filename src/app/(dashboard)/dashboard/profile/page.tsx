'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { talentsAPI } from '@/lib/api/talents';
import api from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TalentProfile, Skill, TalentSkill, Experience, Education, Portfolio } from '@/types';

const profileSchema = z.object({
  title: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate: z.number().min(0).optional(),
  hourly_rate_currency: z.string().default('USD'),
  availability: z.enum(['available', 'busy', 'not_available']),
  experience_level: z.enum(['entry', 'junior', 'intermediate', 'senior', 'expert']),
  location: z.string().optional(),
  is_remote_available: z.boolean().default(false),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function TalentProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch profile
  const { data: profile, isLoading } = useQuery<TalentProfile>({
    queryKey: ['talent-profile'],
    queryFn: talentsAPI.getProfile,
  });

  // Fetch all skills for selection
  const { data: allSkillsData } = useQuery({
    queryKey: ['all-skills'],
    queryFn: async () => {
      const response = await api.get('/public/skills');
      return response.data;
    },
  });

  const allSkills = allSkillsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      title: profile.title || '',
      bio: profile.bio || '',
      hourly_rate: profile.hourly_rate || 0,
      hourly_rate_currency: profile.hourly_rate_currency || 'USD',
      availability: profile.availability || 'available',
      experience_level: profile.experience_level || 'intermediate',
      location: profile.location || '',
      is_remote_available: profile.is_remote_available || false,
      portfolio_url: profile.portfolio_url || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      website_url: profile.website_url || '',
    } : undefined,
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => talentsAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => talentsAPI.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-profile'] });
      toast.success('Avatar uploaded successfully');
      setSelectedFile(null);
    },
    onError: () => {
      toast.error('Failed to upload avatar');
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={updateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Quick Info */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="h-32 w-32 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-4xl mx-auto">
                    {profile?.user?.first_name?.charAt(0)}{profile?.user?.last_name?.charAt(0)}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <Upload className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                  {profile?.user?.first_name} {profile?.user?.last_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile?.title || 'No title set'}
                </p>

                {/* Availability Badge */}
                <div className="mt-3">
                  <span className={`
                    inline-flex px-3 py-1 text-sm font-medium rounded-full
                    ${profile?.availability === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                    ${profile?.availability === 'busy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
                    ${profile?.availability === 'not_available' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
                  `}>
                    {profile?.availability === 'available' && 'Available for Work'}
                    {profile?.availability === 'busy' && 'Currently Busy'}
                    {profile?.availability === 'not_available' && 'Not Available'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {profile?.experience_level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${profile?.hourly_rate || 0}/hr
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {profile?.is_remote_available ? 'Remote' : profile?.location || 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white break-all">
                  {profile?.user?.email}
                </span>
              </div>
              {profile?.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {profile.location}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Professional Title
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="e.g., Full-stack Developer"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Experience Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Experience Level
                      </label>
                      <select
                        {...register('experience_level')}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="junior">Junior</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="senior">Senior</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Availability
                      </label>
                      <select
                        {...register('availability')}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="not_available">Not Available</option>
                      </select>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hourly Rate
                      </label>
                      <input
                        {...register('hourly_rate', { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Currency
                      </label>
                      <select
                        {...register('hourly_rate_currency')}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="AED">AED</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="e.g., New York, NY"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Remote Available */}
                  <div className="flex items-center gap-2">
                    <input
                      {...register('is_remote_available')}
                      type="checkbox"
                      id="remote"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote" className="text-sm text-gray-700 dark:text-gray-300">
                      Available for remote work
                    </label>
                  </div>

                  {/* Social Links */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Social Links
                    </h3>
                    <div className="space-y-3">
                      <input
                        {...register('portfolio_url')}
                        type="url"
                        placeholder="Portfolio URL"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        {...register('linkedin_url')}
                        type="url"
                        placeholder="LinkedIn URL"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        {...register('github_url')}
                        type="url"
                        placeholder="GitHub URL"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        {...register('website_url')}
                        type="url"
                        placeholder="Website URL"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</p>
                    <p className="text-gray-900 dark:text-white">
                      {profile?.bio || 'No bio added yet'}
                    </p>
                  </div>
                  
                  {(profile?.portfolio_url || profile?.linkedin_url || profile?.github_url || profile?.website_url) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Links</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.portfolio_url && (
                          <a
                            href={profile.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Portfolio
                          </a>
                        )}
                        {profile?.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            LinkedIn
                          </a>
                        )}
                        {profile?.github_url && (
                          <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            GitHub
                          </a>
                        )}
                        {profile?.website_url && (
                          <a
                            href={profile.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills, Experience, Education, Portfolio sections will be added as separate components */}
          <SkillsSection profileId={profile?.id} skills={profile?.skills} allSkills={allSkills} />
          <ExperienceSection profileId={profile?.id} experiences={profile?.experiences} />
          <EducationSection profileId={profile?.id} education={profile?.education} />
          <PortfolioSection profileId={profile?.id} portfolios={profile?.portfolios} />
        </div>
      </div>
    </div>
  );
}

// Placeholder components - will be implemented separately
function SkillsSection({ profileId, skills, allSkills }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Skills section coming soon...
        </p>
      </CardContent>
    </Card>
  );
}

function ExperienceSection({ profileId, experiences }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Work Experience</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Experience section coming soon...
        </p>
      </CardContent>
    </Card>
  );
}

function EducationSection({ profileId, education }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Education</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Education section coming soon...
        </p>
      </CardContent>
    </Card>
  );
}

function PortfolioSection({ profileId, portfolios }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Portfolio section coming soon...
        </p>
      </CardContent>
    </Card>
  );
}