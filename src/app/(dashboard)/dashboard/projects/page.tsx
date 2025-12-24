'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { projectsAPI } from '@/lib/api/projects';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const user = useAuthStore((state) => state.user);
  const isRecruiter = user?.user_type === 'recruiter';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    experience_level: '',
    project_type: '',
    is_remote: '',
  });
  const [page, setPage] = useState(1);

  // Fetch projects
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', page, filters, searchQuery],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 12,
        ...filters,
      };
      
      if (searchQuery) {
        return await projectsAPI.searchProjects(searchQuery, params);
      }
      if (isRecruiter) {
        return await projectsAPI.getRecruiterProjects(params);
      }
      
      return await projectsAPI.getProjects(params);
    },
  });

  const projects = data?.data?.data || [];
  const pagination = data?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRecruiter ? 'My Projects' : 'Browse Projects'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isRecruiter 
              ? 'Manage your posted projects'
              : 'Find your next opportunity'}
          </p>
        </div>
        {isRecruiter && (
          <Link href="/dashboard/projects/create">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Post Project
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects by title, skills, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Experience Level Filter */}
          <select
            value={filters.experience_level}
            onChange={(e) => setFilters({ ...filters, experience_level: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Experience Levels</option>
            <option value="entry">Entry</option>
            <option value="junior">Junior</option>
            <option value="intermediate">Intermediate</option>
            <option value="senior">Senior</option>
            <option value="expert">Expert</option>
          </select>

          {/* Project Type Filter */}
          <select
            value={filters.project_type}
            onChange={(e) => setFilters({ ...filters, project_type: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Project Types</option>
            <option value="fixed">Fixed Price</option>
            <option value="hourly">Hourly Rate</option>
            <option value="contract">Contract</option>
            <option value="full-time">Full-time</option>
          </select>

          {/* Remote Filter */}
          <select
            value={filters.is_remote}
            onChange={(e) => setFilters({ ...filters, is_remote: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Locations</option>
            <option value="true">Remote Only</option>
            <option value="false">On-site Only</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilters({
                experience_level: '',
                project_type: '',
                is_remote: '',
              });
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading projects. Please try again.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === meta.last_page}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}