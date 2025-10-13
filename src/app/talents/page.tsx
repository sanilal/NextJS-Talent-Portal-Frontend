'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/axios';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TalentDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    skills: searchParams.get('skills')?.split(',') || [],
    experience_level: searchParams.get('experience') || '',
    availability: searchParams.get('availability') || '',
    min_rate: searchParams.get('min_rate') || '',
    max_rate: searchParams.get('max_rate') || '',
    search: searchParams.get('q') || '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    searchTalents();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, skillsRes] = await Promise.all([
        api.get('/api/v1/public/categories'),
        api.get('/api/v1/public/skills'),
      ]);
      setCategories(categoriesRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const searchTalents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/public/talents', {
        params: {
          ...filters,
          skills: filters.skills.join(','),
        }
      });
      setTalents(response.data.data || response.data);
    } catch (error) {
      console.error('Error searching talents:', error);
      setTalents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      skills: [],
      experience_level: '',
      availability: '',
      min_rate: '',
      max_rate: '',
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Talent Bank</h1>
          <p className="text-gray-600 mt-2">
            Discover talented professionals for your next project
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Name, title, skills..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience_level}
                  onChange={(e) => updateFilter('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Level</option>
                  <option value="entry">Entry</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateFilter('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  <option value="available">Available Now</option>
                  <option value="unavailable">Not Available</option>
                </select>
              </div>

              {/* Hourly Rate Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.min_rate}
                    onChange={(e) => updateFilter('min_rate', e.target.value)}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.max_rate}
                    onChange={(e) => updateFilter('max_rate', e.target.value)}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{talents.length}</span> talents found
                </p>
              </div>
            </div>
          </aside>

          {/* Talents Grid */}
          <main className="lg:col-span-3 mt-8 lg:mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : talents.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No talents found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {talents.map((talent: any) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function TalentCard({ talent }: { talent: any }) {
  const router = useRouter();
  const profile = talent.talentProfile || talent.talent_profile;

  return (
    <div
      onClick={() => router.push(`/talents/${talent.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* Avatar/Photo */}
      <div className="relative h-64 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
        {profile?.avatar_url ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${profile.avatar_url}`}
            alt={talent.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
            {talent.first_name?.charAt(0)}{talent.last_name?.charAt(0)}
          </div>
        )}
        
        {/* Availability Badge */}
        {profile?.is_available && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            Available
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {talent.first_name} {talent.last_name}
        </h3>
        
        {profile?.professional_title && (
          <p className="text-sm text-gray-600 mb-3 truncate">
            {profile.professional_title}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm mb-3">
          {profile?.experience_level && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
              {profile.experience_level}
            </span>
          )}
          {profile?.hourly_rate_min && (
            <span className="font-semibold text-gray-900">
              ${profile.hourly_rate_min}/hr
            </span>
          )}
        </div>

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {talent.skills.slice(0, 3).map((skill: any, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill.skill?.name || skill.name}
              </span>
            ))}
            {talent.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{talent.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* View Profile Button */}
        <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm group-hover:bg-blue-700 transition-colors">
          View Profile →
        </button>
      </div>
    </div>
  );
}