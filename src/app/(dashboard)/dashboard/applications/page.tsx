'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import { applicationsAPI } from '@/lib/api/applications';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateRelative } from '@/lib/utils';
import type { Application } from '@/types';

export default function ApplicationsPage() {
  const user = useAuthStore((state) => state.user);
  const isRecruiter = user?.user_type === 'recruiter';
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Fetch applications based on user type
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', statusFilter, page, isRecruiter],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 20,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (isRecruiter) {
        return await applicationsAPI.getRecruiterApplications(params);
      } else {
        return await applicationsAPI.getTalentApplications(params);
      }
    },
  });

  const applications = data?.data || [];
  const meta = data?.meta;

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app: Application) => app.status === 'pending').length,
    reviewing: applications.filter((app: Application) => app.status === 'reviewing').length,
    accepted: applications.filter((app: Application) => app.status === 'accepted').length,
    rejected: applications.filter((app: Application) => app.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock,
      },
      reviewing: {
        label: 'Reviewing',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        icon: FileText,
      },
      shortlisted: {
        label: 'Shortlisted',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        icon: CheckCircle,
      },
      accepted: {
        label: 'Accepted',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
      },
      withdrawn: {
        label: 'Withdrawn',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        icon: XCircle,
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isRecruiter ? 'Applications Received' : 'My Applications'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isRecruiter 
            ? 'Review and manage applications for your projects'
            : 'Track the status of your project applications'}
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'reviewing', label: 'Reviewing' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${statusFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }
            `}
          >
            {tab.label}
            {tab.value === 'all' && statusCounts.all > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-700 text-white">
                {statusCounts.all}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading applications. Please try again.</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No applications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isRecruiter 
              ? 'No one has applied to your projects yet'
              : "You haven't applied to any projects yet"}
          </p>
          {!isRecruiter && (
            <Link href="/dashboard/projects">
              <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Browse Projects
              </button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((application: Application) => (
              <Link
                key={application.id}
                href={`/dashboard/applications/${application.id}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Avatar/Initial */}
                          {isRecruiter && application.talent?.user ? (
                            <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                              {application.talent.user.first_name?.charAt(0)}
                              {application.talent.user.last_name?.charAt(0)}
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {isRecruiter 
                                ? `${application.talent?.user?.first_name} ${application.talent?.user?.last_name}`
                                : application.project?.title
                              }
                            </h3>

                            {/* Subtitle */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {isRecruiter 
                                ? `Applied to: ${application.project?.title}`
                                : application.talent?.title || 'Talent'
                              }
                            </p>

                            {/* Cover Letter Preview */}
                            {application.cover_letter && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {application.cover_letter}
                              </p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatDateRelative(application.created_at)}</span>
                              {application.proposed_rate && (
                                <>
                                  <span>•</span>
                                  <span>Proposed Rate: ${application.proposed_rate}</span>
                                </>
                              )}
                              {application.proposed_duration && (
                                <>
                                  <span>•</span>
                                  <span>Duration: {application.proposed_duration} days</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Status */}
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(application.status)}
                        {isRecruiter && application.status === 'pending' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Action required
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.last_page}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}