'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Star,
  Grid3x3,
  List,
  X,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { talentsAPI, publicTalentsAPI } from '@/lib/api/talents';
import type { TalentProfile, TalentFilters, Skill, Category } from '@/types';

// ✅ Separate component that uses useSearchParams
function TalentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<TalentFilters>(() => {
    const skills = searchParams.get('skills');
    return {
      search: searchParams.get('search') || '',
      skills: skills ? skills.split(',').map(Number) : undefined,
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      availability_status: searchParams.get('availability_status') || undefined,
      min_rate: searchParams.get('min_rate') ? Number(searchParams.get('min_rate')) : undefined,
      max_rate: searchParams.get('max_rate') ? Number(searchParams.get('max_rate')) : undefined,
      location: searchParams.get('location') || undefined,
      is_available: searchParams.get('is_available') === 'true' ? true : undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      per_page: 12,
    };
  });

  // Fetch talents with filters
  const { data: talentsResponse, isLoading } = useQuery({
    queryKey: ['public-talents', filters],
    queryFn: () => publicTalentsAPI.list(filters),
    placeholderData: (previousData) => previousData,
  });

  // Fetch skills for filter dropdown
  const { data: skillsResponse } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => publicTalentsAPI.skills(),
  });

  // Fetch categories for filter dropdown
  const { data: categoriesResponse } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => publicTalentsAPI.categories(),
  });

  const talents = talentsResponse?.data?.data || [];
  const pagination = talentsResponse?.data;
  const skills = skillsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const handleFilterChange = (key: keyof TalentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleSkill = (skillId: number) => {
    setFilters(prev => {
      const currentSkills = prev.skills || [];
      const newSkills = currentSkills.includes(skillId)
        ? currentSkills.filter(id => id !== skillId)
        : [...currentSkills, skillId];
      return { ...prev, skills: newSkills.length > 0 ? newSkills : undefined, page: 1 };
    });
  };

  const clearFilters = () => {
    setFilters({ 
      page: 1, 
      per_page: 12,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const hasActiveFilters = Object.keys(filters).some(
    key => !['page', 'per_page', 'sort_by', 'sort_order'].includes(key) && 
           filters[key as keyof TalentFilters] !== undefined
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Talented Professionals</h1>
          <p className="mt-2 text-gray-600">
            Browse {pagination?.meta?.total || 0} talented professionals ready for your next project
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Sort By */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ 
                  ...prev, 
                  sort_by: sortBy as any, 
                  sort_order: sortOrder as 'asc' | 'desc' 
                }));
              }}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="hourly_rate_min-asc">Rate (Low to High)</option>
              <option value="hourly_rate_min-desc">Rate (High to Low)</option>
              <option value="average_rating-desc">Highest Rated</option>
              <option value="profile_views-desc">Most Viewed</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                title="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.experience_level || ''}
                    onChange={(e) => handleFilterChange('experience_level', e.target.value || undefined)}
                  >
                    <option value="">All Levels</option>
                    <option value="entry">Entry</option>
                    <option value="junior">Junior</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State, or Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                  />
                </div>
              </div>

              {/* Hourly Rate Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate Range
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.min_rate || ''}
                    onChange={(e) => handleFilterChange('min_rate', e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filters.max_rate || ''}
                    onChange={(e) => handleFilterChange('max_rate', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 15).map((skill: Skill) => (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.skills?.includes(skill.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.is_available || false}
                    onChange={(e) => handleFilterChange('is_available', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Available Now Only</span>
                </label>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading talents...</p>
          </div>
        ) : talents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No talents found matching your criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Clear filters to see all talents
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {talents.map((talent: TalentProfile) => (
                <TalentCard
                  key={talent.id}
                  talent={talent}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.meta && pagination.meta.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: pagination.meta.last_page }, (_, i) => i + 1)
                    .filter(page => {
                      const current = filters.page || 1;
                      return page === 1 || 
                             page === pagination.meta.last_page || 
                             Math.abs(page - current) <= 2;
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center gap-2">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handleFilterChange('page', page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === filters.page
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => handleFilterChange('page', Math.min(pagination.meta.last_page, (filters.page || 1) + 1))}
                  disabled={filters.page === pagination.meta.last_page}
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

// ✅ Main page component with Suspense boundary
export default function TalentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TalentsContent />
    </Suspense>
  );
}

// Talent Card Component
function TalentCard({ 
  talent, 
  viewMode 
}: { 
  talent: TalentProfile; 
  viewMode: 'grid' | 'list' 
}) {
  const primarySkill = talent.skills?.find(s => s.is_primary);
  const skillsList = talent.skills || [];
  
  const availabilityConfig: Record<string, { color: string; label: string }> = {
    available: { color: 'bg-green-100 text-green-800', label: 'Available' },
    busy: { color: 'bg-yellow-100 text-yellow-800', label: 'Busy' },
    not_available: { color: 'bg-red-100 text-red-800', label: 'Not Available' },
  };
  
  const availabilityStatus = (talent as any).availability_status || 'not_available';
  const availability = availabilityConfig[availabilityStatus];

  const userAvatar = (talent.user?.avatar_url || (talent as any).avatar) as string | undefined;
  const firstName = talent.user?.first_name || (talent as any).first_name || 'User';
  const lastName = talent.user?.last_name || (talent as any).last_name || '';
  
  const avatarUrl = userAvatar 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${userAvatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${firstName} ${lastName}`
      )}&size=128&background=4F46E5&color=fff&bold=true`;

  if (viewMode === 'list') {
    return (
      <Link href={`/talents/${talent.id}`}>
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex gap-6">
          <img
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                `${firstName} ${lastName}`
              )}&size=128&background=4F46E5&color=fff&bold=true`;
            }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {firstName} {lastName}
                </h3>
                <p className="text-gray-600">
                  {talent.professional_title || primarySkill?.skill?.name || 'Professional'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${availability.color}`}>
                {availability.label}
              </span>
            </div>
            
            {talent.summary && (
              <p className="mt-2 text-gray-600 line-clamp-2">{talent.summary}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {skillsList.filter(ts => ts.show_on_profile).slice(0, 5).map(ts => (
                <span
                  key={ts.id}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {ts.skill?.icon} {ts.skill?.name}
                </span>
              ))}
              {skillsList.filter(ts => ts.show_on_profile).length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  +{skillsList.filter(ts => ts.show_on_profile).length - 5} more
                </span>
              )}
            </div>
            
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              {talent.experience_level && (
                <span className="flex items-center gap-1 capitalize">
                  <Briefcase className="w-4 h-4" />
                  {talent.experience_level.replace('_', ' ')}
                </span>
              )}
              {talent.hourly_rate_min && (
                <span className="flex items-center gap-1 font-semibold text-gray-900">
                  <DollarSign className="w-4 h-4" />
                  ${talent.hourly_rate_min}
                  {talent.hourly_rate_max && talent.hourly_rate_max !== talent.hourly_rate_min && 
                    `-$${talent.hourly_rate_max}`
                  }/hr
                </span>
              )}
              {talent.average_rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {Number(talent.average_rating).toFixed(1)} ({talent.total_ratings || 0})
                </span>
              )}
              {(talent as any).location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {(talent as any).location}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/talents/${talent.id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${availability.color}`}>
            {availability.label}
          </span>
        </div>
        
        <div className="p-6 text-center">
          <img
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            className="w-24 h-24 rounded-full border-4 border-white mx-auto -mt-16 mb-4 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                `${firstName} ${lastName}`
              )}&size=128&background=4F46E5&color=fff&bold=true`;
            }}
          />
          
          <h3 className="text-xl font-semibold text-gray-900">
            {firstName} {lastName}
          </h3>
          <p className="text-gray-600 mt-1">
            {talent.professional_title || primarySkill?.skill?.name || 'Professional'}
          </p>
          
          {talent.summary && (
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">{talent.summary}</p>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {skillsList.filter(ts => ts.show_on_profile).slice(0, 3).map(ts => (
              <span
                key={ts.id}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
              >
                {ts.skill?.icon} {ts.skill?.name}
              </span>
            ))}
            {skillsList.filter(ts => ts.show_on_profile).length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{skillsList.filter(ts => ts.show_on_profile).length - 3}
              </span>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
            {talent.experience_level && (
              <span className="capitalize">{talent.experience_level.replace('_', ' ')}</span>
            )}
            {talent.hourly_rate_min && (
              <span className="font-semibold text-gray-900">
                ${talent.hourly_rate_min}/hr
              </span>
            )}
            {talent.average_rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {Number(talent.average_rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}