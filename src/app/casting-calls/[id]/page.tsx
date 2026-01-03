'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  DollarSign,
  Building,
  User,
  Eye,
  Star,
  Edit,
  Send,
} from 'lucide-react';

export default function CastingCallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const castingCallId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Fetch casting call details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-casting-call', castingCallId],
    queryFn: async () => {
      const response = await api.get(`/public/casting-calls/${castingCallId}`);
      return response.data;
    },
    enabled: !!castingCallId,
  });

  const castingCall = data?.data;

  // Check if current user is the owner
  const isOwner = isAuthenticated && castingCall && user?.id === castingCall.recruiter_id;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading casting call...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !castingCall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Casting Call Not Found
            </h1>
            <p className="text-gray-600">
              The casting call you're looking for doesn't exist or is no longer available.
            </p>
          </div>

          <button
            onClick={() => router.push('/casting-calls')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Casting Calls
          </button>
        </div>
      </div>
    );
  }

  const deadline = new Date(castingCall.deadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysUntilDeadline < 0;

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
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-600">
                    {user?.first_name} {user?.last_name}
                  </span>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600">
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

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Casting Calls
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 h-64 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {castingCall.is_featured && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded">
              <Star className="w-4 h-4 inline mr-1" />
              FEATURED
            </span>
          )}
          {castingCall.is_urgent && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
              URGENT
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 -mt-32 relative z-10">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {castingCall.title}
              </h1>
              <p className="text-xl text-gray-600">{castingCall.project_name}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
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

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{castingCall.views_count || 0} views</span>
                </div>
              </div>

              {/* Deadline Warning */}
              {!isExpired && daysUntilDeadline <= 7 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    ⚠️ Application deadline in {daysUntilDeadline} day(s)!
                  </p>
                </div>
              )}

              {isExpired && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 font-semibold">
                    This casting call has expired.
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {castingCall.description && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  About the Project
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {castingCall.description}
                </p>
              </div>
            )}

            {/* Synopsis */}
            {castingCall.synopsis && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Synopsis</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {castingCall.synopsis}
                </p>
              </div>
            )}

            {/* Project Details */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {castingCall.director && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Director</p>
                      <p className="font-medium text-gray-900">{castingCall.director}</p>
                    </div>
                  </div>
                )}

                {castingCall.production_company && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Production Company</p>
                      <p className="font-medium text-gray-900">
                        {castingCall.production_company}
                      </p>
                    </div>
                  </div>
                )}

                {castingCall.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{castingCall.location}</p>
                      {castingCall.city && (
                        <p className="text-sm text-gray-600">{castingCall.city}</p>
                      )}
                    </div>
                  </div>
                )}

                {castingCall.deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Application Deadline</p>
                      <p className="font-medium text-gray-900">
                        {deadline.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {castingCall.audition_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Audition Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(castingCall.audition_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {castingCall.compensation_type && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Compensation</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {castingCall.compensation_type}
                        {castingCall.rate_amount && (
                          <span className="ml-1">
                            - {castingCall.rate_currency} {castingCall.rate_amount}
                            {castingCall.rate_period && ` / ${castingCall.rate_period}`}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Roles/Requirements */}
            {castingCall.requirements && castingCall.requirements.length > 0 && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Users className="w-5 h-5 inline mr-2" />
                  Roles Needed
                </h2>
                <div className="space-y-4">
                  {castingCall.requirements.map((req: any) => (
                    <div key={req.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {req.role_name}
                      </h3>
                      {req.role_description && (
                        <p className="text-gray-700 mb-3">{req.role_description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {req.gender && req.gender !== 'any' && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            Gender: {req.gender}
                          </span>
                        )}
                        {req.age_group && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                            Age: {req.age_group}
                          </span>
                        )}
                        {req.skin_tone && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                            Skin Tone: {req.skin_tone}
                          </span>
                        )}
                        {req.height && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                            Height: {req.height}
                          </span>
                        )}
                        {req.subcategory && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {req.subcategory.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {castingCall.additional_notes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Information
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {castingCall.additional_notes}
                </p>
              </div>
            )}

            {/* Action Buttons based on Auth State */}
            {!isExpired && (
              <>
                {/* If user is the owner - show Edit button */}
                {isOwner && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Manage Your Casting Call
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You are the owner of this casting call. You can edit or manage it.
                    </p>
                    <Link
                      href={`/dashboard/casting-calls/${castingCallId}/edit`}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Casting Call
                    </Link>
                  </div>
                )}

                {/* If user is logged in but NOT the owner - show Apply button */}
                {isAuthenticated && !isOwner && user?.user_type === 'talent' && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to apply?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Submit your application and showcase your talent for this role.
                    </p>
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Apply Now
                    </button>
                  </div>
                )}

                {/* If user is NOT logged in - show Sign In/Register buttons */}
                {!isAuthenticated && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Interested in this role?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Sign in or create an account to apply for this casting call.
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/login?redirect=/casting-calls/${castingCallId}`}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Sign In to Apply
                      </Link>
                      <Link
                        href={`/register?redirect=/casting-calls/${castingCallId}`}
                        className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}

                {/* If logged in as recruiter but not owner */}
                {isAuthenticated && !isOwner && user?.user_type === 'recruiter' && (
                  <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600">
                      You are logged in as a recruiter. Only talent accounts can apply to casting calls.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recruiter Info Sidebar */}
          {castingCall.recruiter && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Posted By
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {castingCall.recruiter.first_name} {castingCall.recruiter.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Recruiter</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal (placeholder - will be created next) */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply to Casting Call</h2>
            <p className="text-gray-600 mb-4">
              Application form coming soon. You will be redirected to the application page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/dashboard/casting-calls/${castingCallId}/apply`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Application
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
