'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Edit, Mail, MapPin, DollarSign, Briefcase, Award, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api/axios';

export default function ProfilePage() {
  const { user } = useAuthStore();

  // Fetch complete profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['talent-profile'],
    queryFn: async () => {
      const response = await api.get('/talent/profile');
      return response.data;
    },
  });

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

  const skills = profile?.skills || [];
  const experiences = profile?.experiences || [];
  const education = profile?.education || [];

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
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${user?.first_name} ${user?.last_name}`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {profile?.professional_title || 'No title set'}
              </p>

              <div className="flex flex-wrap gap-4 mt-4">
                {profile?.experience_level && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{profile.experience_level}</span>
                  </div>
                )}
                {(profile?.city || profile?.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Not set'}
                    </span>
                  </div>
                )}
                {profile?.hourly_rate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{profile.currency || '$'}{profile.hourly_rate}/hr</span>
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
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Bio</h3>
              <p className="text-gray-900 dark:text-white">
                {profile?.bio || 'No bio added yet'}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
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
              {skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill: any) => (
                    <div
                      key={skill.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {skill.skill?.name || skill.name}
                      </h3>
                      {skill.proficiency_level && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                          {skill.proficiency_level}
                        </p>
                      )}
                      {skill.years_of_experience && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {skill.years_of_experience} years experience
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No skills added yet</p>
                  <Link href="/dashboard/skills">
                    <Button variant="outline" size="sm" className="mt-3">
                      Add Skills
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
                    Manage Experience
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-primary-600 pl-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {exp.title || exp.job_title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.company}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
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
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {user?.email}
                </span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {user.phone}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

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
                    <div key={edu.id}>
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {edu.degree}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(edu.start_date).getFullYear()} - {edu.is_current ? 'Present' : new Date(edu.end_date).getFullYear()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <GraduationCap className="h-10 w-10 text-gray-400 mx-auto mb-2" />
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