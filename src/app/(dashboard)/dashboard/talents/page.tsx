'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Sparkles } from 'lucide-react';
import { searchAPI } from '@/lib/api/search';
import { Button } from '@/components/ui/button';
import { TalentCard } from '@/components/talents/TalentCard';
import { debounce } from '@/lib/utils';
import type { TalentProfile, SearchFilters } from '@/types';

export default function TalentSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    experience_level: [],
    availability: [],
    is_remote: undefined,
    hourly_rate_min: undefined,
    hourly_rate_max: undefined,
  });
  const [useAI, setUseAI] = useState(true);

  // Debounced search
  const handleSearchChange = debounce((value: string) => {
    setDebouncedQuery(value);
  }, 500);

  // Fetch talents
  const { data, isLoading, error } = useQuery({
    queryKey: ['talents-search', debouncedQuery, filters, useAI],
    queryFn: async () => {
      if (useAI && debouncedQuery) {
        // Use AI-powered semantic search
        return await searchAPI.searchTalents({
          query: debouncedQuery,
          filters,
          limit: 20,
        });
      } else {
        // Regular search/browse
        const response = await api.get('/recruiter/talents/search', {
          params: {
            query: debouncedQuery,
            ...filters,
            limit: 20,
          },
        });
        return response.data;
      }
    },
    enabled: debouncedQuery.length >= 3 || !useAI,
  });

  const talents = data?.data || data?.talents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Find Talents
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {useAI 
            ? 'Use AI-powered search to find the perfect match for your project'
            : 'Browse and search for talented professionals'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for 'React developer with 5 years experience' or 'Laravel expert for API development'..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchChange(e.target.value);
              }}
              className="block w-full pl-10 pr-32 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {useAI && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </span>
              </div>
            )}
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ai-search"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="ai-search" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Use AI-powered semantic search
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {useAI ? 'AI will understand your requirements naturally' : 'Using traditional keyword search'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              multiple
              value={filters.experience_level}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFilters({ ...filters, experience_level: values });
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              size={3}
            >
              <option value="entry">Entry</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Availability
            </label>
            <select
              multiple
              value={filters.availability}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFilters({ ...filters, availability: values });
              }}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              size={3}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>

          {/* Hourly Rate Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hourly Rate (Min)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.hourly_rate_min || ''}
              onChange={(e) => setFilters({ ...filters, hourly_rate_min: e.target.value ? Number(e.target.value) : undefined })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hourly Rate (Max)
            </label>
            <input
              type="number"
              placeholder="1000"
              value={filters.hourly_rate_max || ''}
              onChange={(e) => setFilters({ ...filters, hourly_rate_max: e.target.value ? Number(e.target.value) : undefined })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Remote Only */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="remote-only"
            checked={filters.is_remote === true}
            onChange={(e) => setFilters({ ...filters, is_remote: e.target.checked ? true : undefined })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="remote-only" className="text-sm text-gray-700 dark:text-gray-300">
            Remote only
          </label>
        </div>

        {/* Clear Filters */}
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                experience_level: [],
                availability: [],
                is_remote: undefined,
                hourly_rate_min: undefined,
                hourly_rate_max: undefined,
              });
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results */}
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
          <p className="text-red-600">Error loading talents. Please try again.</p>
        </div>
      ) : debouncedQuery.length > 0 && debouncedQuery.length < 3 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Type at least 3 characters to search
          </p>
        </div>
      ) : talents.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No talents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search query or filters
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {talents.length} talented {talents.length === 1 ? 'professional' : 'professionals'}
              {useAI && debouncedQuery && (
                <span className="ml-2 text-primary-600 dark:text-primary-400">
                  (AI matched)
                </span>
              )}
            </p>
          </div>

          {/* Talents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((talent: TalentProfile) => (
              <TalentCard 
                key={talent.id} 
                talent={talent}
                showSimilarityScore={useAI && debouncedQuery}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}