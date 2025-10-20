'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Clock,
  Eye,
  Plus,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DashboardStats, Application, Project } from '@/types';
import { VerificationBanner } from '@/components/VerificationBanner';

export default function RecruiterDashboard() {
  const { user, token, isAuthenticated, _hasHydrated } = useAuthStore();
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  useEffect(() => {
    console.log('🔍 Recruiter Dashboard Auth State:', {
      user,
      userType: user?.user_type,
      token: token ? 'EXISTS' : 'NULL',
      isAuthenticated,
      hasHydrated: _hasHydrated,
    });
  }, [user, token, isAuthenticated, _hasHydrated]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['recruiter-dashboard-stats'],
    enabled: _hasHydrated && isAuthenticated,
    retry: 1,
    queryFn: async () => {
      console.log('📊 Fetching recruiter stats...');
      const response = await api.get('/recruiter/dashboard');
      return response.data || {};
    },
  });

  // Fetch user's projects (not filtered by status to get all projects)
  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['recruiter-projects'],
    enabled: _hasHydrated && isAuthenticated,
    retry: 1,
    queryFn: async () => {
      console.log('📂 Fetching recruiter projects...');
      // Get all projects for this recruiter, limit to 5 most recent
      const response = await api.get('/projects?limit=5&sort_by=created_at&sort_order=desc');
      return response.data;
    },
  });

  // Extract projects array from response
  const projects = projectsResponse?.data || projectsResponse || [];

  // Fetch applications for all user's projects
  const { data: allApplications, isLoading: appsLoading, error: appsError } = useQuery<Application[]>({
    queryKey: ['recruiter-applications', projects],
    enabled: _hasHydrated && isAuthenticated && projects.length > 0,
    retry: 1,
    queryFn: async () => {
      console.log('📝 Fetching applications for projects...');
      
      if (!projects || projects.length === 0) {
        return [];
      }

      // Fetch applications for each project and combine them
      const applicationPromises = projects.slice(0, 5).map(async (project: any) => {
        try {
          const response = await api.get(`/projects/${project.id}/applications`);
          const apps = response.data?.data || response.data || [];
          // Add project info to each application
          return apps.map((app: any) => ({
            ...app,
            project: project,
          }));
        } catch (error) {
          console.error(`Failed to fetch applications for project ${project.id}:`, error);
          return [];
        }
      });

      const results = await Promise.all(applicationPromises);
      const combined = results.flat();
      
      // Sort by created_at and return most recent 5
      return combined
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    },
  });

  // Collect API errors for display
  useEffect(() => {
    const errors: string[] = [];
    
    if (statsError) {
      const err = statsError as any;
      if (err.response?.status === 403) {
        errors.push('Dashboard requires recruiter permissions. Check user_type in database.');
      } else if (err.response?.status === 404) {
        errors.push('Dashboard endpoint not found');
      } else if (err.response?.status === 401) {
        errors.push('Authentication failed. Try logging out and back in.');
      }
    }
    
    if (projectsError) {
      const err = projectsError as any;
      if (err.response?.status === 401) {
        errors.push('Projects endpoint authentication failed');
      }
    }
    
    if (appsError) {
      const err = appsError as any;
      if (err.response?.status === 404) {
        errors.push('Unable to fetch applications');
      }
    }
    
    setApiErrors(errors);
  }, [statsError, projectsError, appsError]);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Projects',
      value: stats?.active_projects || 0,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Applications',
      value: stats?.total_applications || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pending_applications || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Total Views',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        {user?.account_status === 'pending_verification' && (
          <VerificationBanner />
        )}
        
        {/* API Error Warnings */}
        {apiErrors.length > 0 && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
              <div className="font-semibold mb-2">API Configuration Issues Detected:</div>
              <ul className="list-disc list-inside space-y-1">
                {apiErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs">
                Current user_type: <span className="font-mono">{user?.user_type || 'unknown'}</span>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your projects and review applications
            </p>
            {user?.user_type && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Account type: <span className="font-medium capitalize">{user.user_type}</span>
              </p>
            )}
          </div>
          <Link href="/dashboard/projects/create">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Post New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.applications_count || 0} applications
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                      {project.views_count !== undefined && (
                        <span className="text-xs text-gray-500">
                          {project.views_count} views
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {projectsError ? 'Unable to load projects' : 'No projects yet'}
                </p>
                <Link href="/dashboard/projects/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/dashboard/applications">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : allApplications && allApplications.length > 0 ? (
              <div className="space-y-4">
                {allApplications.map((app: any) => (
                  <Link
                    key={app.id}
                    href={`/dashboard/applications/${app.id}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {app.talent?.user?.first_name} {app.talent?.user?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Applied to: {app.project?.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          New
                        </span>
                      )}
                      {app.status === 'accepted' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Accepted
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {appsError ? 'Unable to load applications' : 'No applications yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/projects/create">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Plus className="h-5 w-5 mr-3" />
                Post New Project
              </Button>
            </Link>
            <Link href="/dashboard/talents">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-5 w-5 mr-3" />
                Find Talents
              </Button>
            </Link>
            <Link href="/dashboard/applications">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="h-5 w-5 mr-3" />
                Review Applications
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}