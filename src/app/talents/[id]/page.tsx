'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Star,
  Mail,
  Phone,
  Globe,
  Calendar,
  Eye,
  Briefcase,
  Award,
  FolderOpen,
  GraduationCap,
} from 'lucide-react';

// Diagnostic logging component
function DiagnosticInfo({ data, talent, profile }: any) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md overflow-auto max-h-96 z-50">
      <h4 className="font-bold mb-2 text-yellow-300">🔍 Debug Info</h4>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            hasRawData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            hasDataData: !!data?.data,
            hasTalent: !!talent,
            hasProfile: !!profile,
            talentKeys: talent ? Object.keys(talent).slice(0, 10) : [],
            profileKeys: profile ? Object.keys(profile || {}) : [],
            firstName: talent?.first_name,
            lastName: talent?.last_name,
            profileTitle: profile?.professional_title,
            skillsCount: profile?.skills?.length || 0,
            apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const talentId = params.id as string;
  const [showDiagnostics, setShowDiagnostics] = useState(true);

  // Fetch talent data - REMOVED /api/v1 prefix since it's in baseURL
  const {
    data,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['public-talent', talentId],
    queryFn: async () => {
      console.log('🔍 Fetching talent with ID:', talentId);
      console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      try {
        // ✅ FIXED: Removed /api/v1 since it's already in baseURL
        const response = await api.get(`/public/talents/${talentId}`);
        console.log('📦 Full API Response:', response);
        console.log('📦 Response Data:', response.data);
        return response.data;
      } catch (err: any) {
        console.error('❌ API Error:', err);
        console.error('❌ Error Response:', err.response);
        throw err;
      }
    },
    enabled: !!talentId,
  });

  // Log query state changes
  useEffect(() => {
    console.log('🎯 Query State Changed:', {
      hasData: !!data,
      isLoading,
      isError,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }, [data, isLoading, isError, error]);

  // Extract talent data - trying both possible structures
  const talent = data?.data?.talent || data?.data || null;
  const stats = data?.data?.stats || {};
  const profile = talent?.talent_profile || null;

  console.log('🎨 Render State:', {
    talent: !!talent,
    profile: !!profile,
    isLoading,
    isError,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading talent profile...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {talentId}</p>
        </div>
      </div>
    );
  }

  // Error state with detailed information
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = (error as any)?.response;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Talent</h1>
            <p className="text-gray-600">We encountered an issue loading this talent profile.</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
            <p className="text-sm text-red-700 mb-2">{errorMessage}</p>
            {errorResponse && (
              <div className="text-xs text-red-600 mt-2">
                <p>Status: {errorResponse.status}</p>
                <p>Status Text: {errorResponse.statusText}</p>
                {errorResponse.data?.message && (
                  <p>Server Message: {errorResponse.data.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Debug Information:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Talent ID: {talentId}</p>
              <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}</p>
              <p>Endpoint: /public/talents/{talentId}</p>
              <p>Full URL: {process.env.NEXT_PUBLIC_API_BASE_URL}/public/talents/{talentId}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!talent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Talent Not Found</h1>
            <p className="text-gray-600">The talent profile you're looking for doesn't exist or is not available.</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">What happened?</h3>
            <p className="text-sm text-yellow-700">
              The API returned data, but we couldn't find the talent information in the expected format.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify({ data, talent, profile }, null, 2)}
            </pre>
          </div>

          <button
            onClick={() => router.push('/talents')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Talents Directory
          </button>
        </div>
      </div>
    );
  }

  // Success! Show the profile
  const skills = profile?.skills || [];
  const experiences = talent?.experiences || profile?.experiences || [];
  const education = talent?.education || profile?.education || [];
  const portfolios = talent?.portfolios || profile?.portfolios || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show diagnostics in development */}
      {showDiagnostics && <DiagnosticInfo data={data} talent={talent} profile={profile} />}

      {/* Toggle diagnostics button (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="fixed bottom-4 left-4 bg-purple-600 text-white px-3 py-2 rounded-lg text-xs z-50 hover:bg-purple-700"
        >
          {showDiagnostics ? '🙈 Hide Debug' : '👁️ Show Debug'}
        </button>
      )}

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Talents
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-64"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 -mt-32 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={
                    talent.avatar
                      ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${talent.avatar}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.first_name + ' ' + talent.last_name)}&size=128&background=random`
                  }
                  alt={`${talent.first_name} ${talent.last_name}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto md:mx-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  {talent.first_name} {talent.last_name}
                </h1>
                <p className="text-xl text-gray-600 mt-1">{profile?.professional_title || 'Professional'}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-4 justify-center md:justify-start">
                  {profile?.hourly_rate_min && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">
                        ${profile.hourly_rate_min}
                        {profile.hourly_rate_max && ` - $${profile.hourly_rate_max}`}/hr
                      </span>
                    </div>
                  )}

                  {profile?.average_rating && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">
                        {Number(profile.average_rating).toFixed(1)} ({profile.total_ratings || 0} reviews)
                      </span>
                    </div>
                  )}

                  {stats?.profile_views > 0 && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span>{stats.profile_views} views</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                  {talent.email && (
                    <a
                      href={`mailto:${talent.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Mail className="w-4 h-4" />
                      {talent.email}
                    </a>
                  )}
                  {talent.phone && (
                    <a
                      href={`tel:${talent.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Phone className="w-4 h-4" />
                      {talent.phone}
                    </a>
                  )}
                  {talent.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {talent.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {profile?.summary && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.summary}</p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skillItem: any) => (
                  <div key={skillItem.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{skillItem.skill?.icon || '🎯'}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{skillItem.skill?.name}</h3>
                          <span className="text-sm text-gray-600">{skillItem.level_display}</span>
                        </div>
                      </div>
                      {skillItem.is_primary && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Primary
                        </span>
                      )}
                    </div>

                    {skillItem.description && (
                      <p className="text-gray-700 text-sm mb-4">{skillItem.description}</p>
                    )}

                    {skillItem.years_of_experience > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{skillItem.years_of_experience}+ years experience</span>
                      </div>
                    )}

                    {skillItem.image_url && (
                      <img
                        src={skillItem.image_url}
                        alt={skillItem.skill?.name}
                        className="mt-4 w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {experiences.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
              </div>
              <div className="space-y-6">
                {experiences.map((exp: any) => (
                  <div key={exp.id} className="border-l-4 border-blue-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{exp.job_title}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    </p>
                    {exp.description && <p className="mt-2 text-gray-700 text-sm">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Education</h2>
              </div>
              <div className="space-y-4">
                {education.map((edu: any) => (
                  <div key={edu.id} className="border-l-4 border-purple-600 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Section */}
          {portfolios.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 mt-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <FolderOpen className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((item: any) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {item.image_path && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${item.image_path}`}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(item.title || 'Portfolio')}`;
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.description && <p className="text-sm text-gray-600 mt-2">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}