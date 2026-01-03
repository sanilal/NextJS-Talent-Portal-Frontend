'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/store/authStore';
import {
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Clock,
  DollarSign,
  Star,
  Eye,
  Search,
} from 'lucide-react';

export default function CastingCallsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { isAuthenticated, user } = useAuthStore();

  // Fetch casting calls
  const { data, isLoading } = useQuery({
    queryKey: ['public-casting-calls', { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '12',
        ...(search && { search }),
      });
      const response = await api.get(`/public/casting-calls?${params}`);
      return response.data;
    },
  });

  const castingCalls = data?.data?.data || [];
  const pagination = data?.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header/Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Talents You Need
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/talents" className="text-gray-700 hover:text-blue-600">
                Browse Talents
              </Link>
              <Link href="/projects" className="text-gray-700 hover:text-blue-600">
                Browse Projects
              </Link>
              <Link href="/casting-calls" className="text-gray-700 hover:text-blue-600 font-semibold">
                Casting Calls
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-600">
                    {user?.first_name} {user?.last_name}
                  </span>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Casting Calls</h1>
          <p className="mt-2 text-gray-600">
            Discover exciting opportunities in film, TV, theater, and more
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search casting calls..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading casting calls...</p>
          </div>
        ) : castingCalls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No casting calls found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {castingCalls.map((castingCall: any) => (
                <CastingCallCard key={castingCall.id} castingCall={castingCall} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.last_page ||
                        Math.abs(pageNum - page) <= 2
                      );
                    })
                    .map((pageNum, idx, arr) => (
                      <div key={pageNum} className="flex items-center gap-2">
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            pageNum === page
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => setPage(Math.min(pagination.last_page, page + 1))}
                  disabled={page === pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CastingCallCard({ castingCall }: { castingCall: any }) {
  const deadline = new Date(castingCall.deadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link href={`/casting-calls/${castingCall.id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-purple-500 to-pink-600">
          {castingCall.is_featured && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
              <Star className="w-3 h-3 inline mr-1" />
              FEATURED
            </span>
          )}
          {castingCall.is_urgent && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              URGENT
            </span>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {castingCall.title}
          </h3>

          {/* Project Name */}
          <p className="text-sm text-gray-600 mb-3">{castingCall.project_name}</p>

          {/* Meta Info */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {castingCall.project_type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{castingCall.project_type.name}</span>
              </div>
            )}

            {castingCall.genre && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <span>{castingCall.genre.name}</span>
              </div>
            )}

            {castingCall.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{castingCall.location}</span>
              </div>
            )}

            {castingCall.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Deadline: {new Date(castingCall.deadline).toLocaleDateString()}
                  {daysUntilDeadline > 0 && daysUntilDeadline <= 7 && (
                    <span className="ml-1 text-red-600 font-semibold">
                      ({daysUntilDeadline}d left)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Requirements Count */}
          {castingCall.requirements && castingCall.requirements.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Users className="w-4 h-4" />
              <span>{castingCall.requirements.length} role(s) needed</span>
            </div>
          )}

          {/* Compensation */}
          {castingCall.compensation_type && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <DollarSign className="w-4 h-4" />
              <span className="capitalize font-semibold">
                {castingCall.compensation_type}
                {castingCall.rate_amount && (
                  <span className="ml-1">
                    {castingCall.rate_currency} {castingCall.rate_amount}
                    {castingCall.rate_period && ` / ${castingCall.rate_period}`}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-auto pt-4 border-t flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{castingCall.views_count || 0} views</span>
            </div>
            <div>
              Posted {new Date(castingCall.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
