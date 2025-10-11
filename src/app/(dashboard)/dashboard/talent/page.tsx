'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Search
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardStats, Application, Project } from '@/types';
import { VerificationBanner } from '@/components/VerificationBanner';

export default function TalentDashboard() {
  const user = useAuthStore((state) => state.user);
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['talent-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/talent/dashboard');
        return response.data || {};
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        return {
          total_applications: 0,
          pending_applications: 0,
          profile_completeness: 0,
          unread_messages: 0,
        };
      }
    },
  });

  // Fetch recent applications
  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['recent-applications'],
    queryFn: async () => {
      try {
        const response = await api.get('/talent/applications?limit=5');
        // Handle different response structures
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        return [];
      }
    },
  });

  // Fetch recommended projects
  const { data: recommendations = [], isLoading: recsLoading } = useQuery<Project[]>({
    queryKey: ['recommended-projects'],
    queryFn: async () => {
      try {
        const response = await api.get('/projects?limit=5');
        // Handle different response structures
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    },
  });

  const statCards = [
    {
      title: 'Active Applications',
      value: stats?.total_applications || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pending_applications || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Profile Views',
      value: stats?.profile_completeness || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      suffix: '%',
    },
    {
      title: 'Unread Messages',
      value: stats?.unread_messages || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
          <div className="container mx-auto px-4 py-8">
         {/* Show banner if user needs verification */}
      {user?.account_status === 'pending_verification' && (
        <VerificationBanner />
      )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's an overview of your activity.
        </p>
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
                    {stat.value}{stat.suffix || ''}
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
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {app.project?.title || 'Untitled Project'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                      {app.status === 'accepted' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No applications yet
                </p>
                <Link href="/dashboard/projects">
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Projects
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recommended for You</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{project.experience_level}</span>
                      <span>•</span>
                      <span>{project.budget_currency} {project.budget_min} - {project.budget_max}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No recommendations available
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
            <Link href="/dashboard/projects">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Search className="h-5 w-5 mr-3" />
                Browse Projects
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="h-5 w-5 mr-3" />
                Update Profile
              </Button>
            </Link>
            <Link href="/dashboard/messages">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <MessageSquare className="h-5 w-5 mr-3" />
                Messages
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}