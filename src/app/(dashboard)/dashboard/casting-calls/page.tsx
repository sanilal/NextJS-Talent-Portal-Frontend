'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCastingCalls, getGenres } from '@/lib/api/casting-calls';
import { getProjectTypes } from '@/lib/api/projects';
import { CastingCallFilters } from '@/types/casting-calls';
import { format } from 'date-fns';

export default function CastingCallsListPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CastingCallFilters>({
    per_page: 12,
    page: 1,
  });

  // Fetch casting calls
  const { data: castingCallsData, isLoading } = useQuery({
    queryKey: ['castingCalls', filters],
    queryFn: () => getCastingCalls(filters),
  });

  // Fetch filter options
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const { data: projectTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: getProjectTypes,
  });

  const handleFilterChange = (key: keyof CastingCallFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Casting Calls</h1>
          <p className="mt-2 text-gray-600">
            Browse and discover casting opportunities
          </p>
        </div>
        <Link
          href="/dashboard/casting-calls/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Post Casting Call
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search casting calls..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <select
              value={filters.genre_id || ''}
              onChange={(e) => handleFilterChange('genre_id', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres?.data?.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type Filter */}
          <div>
            <select
              value={filters.project_type_id || ''}
              onChange={(e) => handleFilterChange('project_type_id', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {projectTypes?.data?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleFilterChange('is_featured', !filters.is_featured)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filters.is_featured
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => handleFilterChange('is_urgent', !filters.is_urgent)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filters.is_urgent
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Urgent
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading casting calls...</p>
        </div>
      )}

      {/* Casting Calls Grid */}
      {!isLoading && castingCallsData?.data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {castingCallsData.data.data.map((call) => (
              <div
                key={call.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/casting-calls/${call.id}`)}
              >
                <div className="p-6">
                  {/* Badges */}
                  <div className="flex gap-2 mb-3">
                    {call.is_featured && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Featured
                      </span>
                    )}
                    {call.is_urgent && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {call.title}
                  </h3>

                  {/* Project Name */}
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Project:</span> {call.project_name}
                  </p>

                  {/* Genre & Type */}
                  <div className="flex gap-2 mb-3">
                    {call.genre && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {call.genre.name}
                      </span>
                    )}
                    {call.projectType && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {call.projectType.name}
                      </span>
                    )}
                  </div>

                  {/* Requirements */}
                  {call.requirements && call.requirements.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Looking for:</p>
                      <div className="flex flex-wrap gap-1">
                        {call.requirements.slice(0, 2).map((req, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                          >
                            {req.role_name}
                          </span>
                        ))}
                        {call.requirements.length > 2 && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                            +{call.requirements.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {call.location && (
                    <p className="text-sm text-gray-600 mb-3">
                      📍 {call.city ? `${call.city}, ` : ''}{call.location}
                    </p>
                  )}

                  {/* Deadline */}
                  <p className="text-sm text-gray-600 mb-4">
                    ⏰ Deadline: {format(new Date(call.deadline), 'MMM dd, yyyy')}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500 pt-3 border-t">
                    <span>👁 {call.views_count} views</span>
                    <span>📝 {call.applications_count} applications</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {castingCallsData.data.data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No casting calls found</p>
            </div>
          )}

          {/* Pagination */}
          {castingCallsData.data.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(castingCallsData.data.current_page - 1)}
                disabled={castingCallsData.data.current_page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {castingCallsData.data.current_page} of {castingCallsData.data.last_page}
              </span>
              <button
                onClick={() => handlePageChange(castingCallsData.data.current_page + 1)}
                disabled={castingCallsData.data.current_page === castingCallsData.data.last_page}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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