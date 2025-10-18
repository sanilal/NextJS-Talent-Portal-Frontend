'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Edit, Mail, Phone, MapPin, DollarSign, Briefcase, Award, GraduationCap, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api/axios';

// Proficiency level mapping
const PROFICIENCY_LEVELS = {
  1: 'Beginner',
  2: 'Intermediate', 
  3: 'Advanced',
  4: 'Expert',
};

const PROFICIENCY_COLORS = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-blue-100 text-blue-800',
  4: 'bg-green-100 text-green-800',
};

export default function ProfilePage() {
  const { user } = useAuthStore();

  // Fetch complete profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['talent-profile'],
    queryFn: async () => {
      const response = await api.get('/talent/profile');
      console.log('Profile Response:', response.data);
      return response.data;
    },
  });

  // Fetch skills separately
  const { data: skillsResponse, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['talent-skills'],
    queryFn: async () => {
      const response = await api.get('/talent/skills');
      console.log('Skills Response:', response.data);
      return response.data;
    },
  });

  const isLoading = isLoadingProfile || isLoadingSkills;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Profile data is already merged in backend response
  const profile = profileData;
  const skillsData = Array.isArray(skillsResponse) ? skillsResponse : (skillsResponse?.data || []);
  const experiences = profile?.experiences || [];
  const education = profile?.education || [];

  // Build avatar URL
  const getAvatarUrl = () => {
    if (profile?.avatar) {
      // If it's already a full URL
      if (profile.avatar.startsWith('http')) {
        return profile.avatar;
      }
      // If it's a storage path
      return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${profile.avatar}`;
    }
    // Fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${profile?.first_name || 'U'} ${profile?.last_name || 'N'}`
    )}&size=200&background=4F46E5&color=fff&bold=true`;
  };

  // Build location string
  const getLocation = () => {
    const parts = [profile?.city, profile?.state, profile?.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not set';
  };

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
        <Link href="/dashboard/profile/edit">
          <Button size="lg">
            <Edit className="h-5 w-5 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={getAvatarUrl()}
                alt={`${profile?.first_name} ${profile?.last_name}`}
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${profile?.first_name || 'U'} ${profile?.last_name || 'N'}`
                  )}&size=200&background=4F46E5&color=fff&bold=true`;
                }}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {profile?.professional_title || 'No title set'}
              </p>

              {/* Availability Badge */}
              {profile?.availability_status && (
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.availability_status === 'available' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : profile.availability_status === 'busy'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {profile.availability_status === 'available' ? '✓ Available' :
                     profile.availability_status === 'busy' ? '⏳ Busy' : 
                     '✕ Not Available'}
                  </span>
                </div>
              )}

              {/* Profile Completion */}
              {profile?.profile_completion !== undefined && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Profile Completion</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile.profile_completion}%
                    </span>
                  </div>
                  <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${profile.profile_completion}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4">
                {profile?.experience_level && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{profile.experience_level.replace('_', ' ')}</span>
                  </div>
                )}
                {(profile?.city || profile?.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocation()}</span>
                  </div>
                )}
                {profile?.hourly_rate && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {profile.currency || '$'}{profile.hourly_rate}/hr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Link href="/dashboard/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bio</h3>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {profile?.bio || 'No bio added yet. Click "Edit" to add your bio.'}
                  </p>
                </div>
                {profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <Link href="/dashboard/skills">
                  <Button variant="outline" size="sm">
                    Manage Skills
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {skillsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillsData.map((talentSkill: any) => {
                    const skill = talentSkill.skill;
                    const proficiencyLevel = talentSkill.proficiency_level || 1;

                    return (
                      <div
                        key={talentSkill.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative hover:shadow-md transition-shadow"
                      >
                        {talentSkill.is_primary && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            Primary
                          </span>
                        )}

                        {/* Skill Image */}
                        {(talentSkill.image_url || talentSkill.image_path) && (
                          <img
                            src={
                              talentSkill.image_url || 
                              `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${talentSkill.image_path}`
                            }
                            alt={skill?.name}
                            className="w-full h-32 object-cover rounded mb-3"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}

                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {skill?.icon} {skill?.name || 'Unknown Skill'}
                          </h3>
                        </div>

                        {proficiencyLevel && (
                          <div className="mb-2">
                            <span className={`
                              inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${PROFICIENCY_COLORS[proficiencyLevel as keyof typeof PROFICIENCY_COLORS]}
                            `}>
                              {PROFICIENCY_LEVELS[proficiencyLevel as keyof typeof PROFICIENCY_LEVELS]}
                            </span>
                          </div>
                        )}

                        {talentSkill.years_of_experience !== undefined && talentSkill.years_of_experience > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {talentSkill.years_of_experience} {talentSkill.years_of_experience === 1 ? 'year' : 'years'} experience
                          </p>
                        )}

                        {talentSkill.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {talentSkill.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No skills added yet</p>
                  <Link href="/dashboard/skills">
                    <Button variant="outline">
                      Add Your First Skill
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Link href="/dashboard/profile/experience">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-blue-600 pl-4 py-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {exp.title || exp.job_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.company}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(exp.start_date).getFullYear()} - {
                          exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()
                        }
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No work experience added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contact Information</CardTitle>
                <Link href="/dashboard/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white break-all">
                  {profile?.email || user?.email}
                </span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {profile.phone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          {(profile?.website || profile?.linkedin_url || profile?.twitter_url || profile?.instagram_url) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="truncate">Website</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span>🔗</span>
                    <span className="truncate">LinkedIn</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span>𝕏</span>
                    <span className="truncate">Twitter</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <span>📷</span>
                    <span className="truncate">Instagram</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Education</CardTitle>
                <Link href="/dashboard/profile/experience">
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu: any) => (
                    <div key={edu.id} className="pb-4 last:pb-0 border-b last:border-0 border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {edu.degree}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(edu.start_date).getFullYear()} - {
                          edu.is_current ? 'Present' : new Date(edu.end_date).getFullYear()
                        }
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No education added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}