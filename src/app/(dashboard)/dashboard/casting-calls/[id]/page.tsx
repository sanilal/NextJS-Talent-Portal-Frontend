'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  getCastingCall,
  publishCastingCall,
  closeCastingCall,
  deleteCastingCall,
} from '@/lib/api/casting-calls';
import { useAuthStore } from '@/store/authStore';




export default function CastingCallDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch casting call
  const { data, isLoading } = useQuery({
    queryKey: ['castingCall', params.id],
    queryFn: () => getCastingCall(params.id),
  });

  const castingCall = data?.data;

  // Check if user owns this casting call
  const isOwner =
    user &&
    castingCall &&
    user.recruiter_profile?.id === castingCall.recruiter_id;

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => publishCastingCall(params.id),
    onSuccess: () => {
      toast.success('Casting call published successfully');
      queryClient.invalidateQueries({ queryKey: ['castingCall', params.id] });
    },
    onError: () => {
      toast.error('Failed to publish casting call');
    },
  });

  // Close mutation
  const closeMutation = useMutation({
    mutationFn: () => closeCastingCall(params.id),
    onSuccess: () => {
      toast.success('Casting call closed successfully');
      queryClient.invalidateQueries({ queryKey: ['castingCall', params.id] });
    },
    onError: () => {
      toast.error('Failed to close casting call');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteCastingCall(params.id),
    onSuccess: () => {
      toast.success('Casting call deleted successfully');
      router.push('/dashboard/casting-calls');
    },
    onError: () => {
      toast.error('Failed to delete casting call');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this casting call?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!castingCall) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Casting call not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/casting-calls"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Casting Calls
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              {castingCall.is_featured && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  Featured
                </span>
              )}
              {castingCall.is_urgent && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                  Urgent
                </span>
              )}
              <span
                className={`px-3 py-1 text-sm rounded-full font-medium ${
                  castingCall.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : castingCall.status === 'closed'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {castingCall.status}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {castingCall.title}
            </h1>
            <p className="text-lg text-gray-600">
              Project: <span className="font-medium">{castingCall.project_name}</span>
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/dashboard/casting-calls/${params.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </Link>
              {castingCall.status === 'draft' && (
                <button
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              {castingCall.status === 'published' && (
                <button
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Project Details</h2>

            <div className="space-y-3">
              {castingCall.genre && (
                <div>
                  <span className="text-sm text-gray-600">Genre:</span>
                  <p className="font-medium">{castingCall.genre.name}</p>
                </div>
              )}

              {castingCall.projectType && (
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <p className="font-medium">{castingCall.projectType.name}</p>
                </div>
              )}

              {castingCall.director && (
                <div>
                  <span className="text-sm text-gray-600">Director:</span>
                  <p className="font-medium">{castingCall.director}</p>
                </div>
              )}

              {castingCall.production_company && (
                <div>
                  <span className="text-sm text-gray-600">Production Company:</span>
                  <p className="font-medium">{castingCall.production_company}</p>
                </div>
              )}
            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Synopsis</h2>
            <p className="text-gray-700 whitespace-pre-line">{castingCall.description}</p>
          </div>

          {/* Requirements */}
          {castingCall.requirements && castingCall.requirements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Looking For</h2>

              <div className="space-y-4">
                {castingCall.requirements.map((req, index) => (
                  <div key={req.id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {req.role_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {req.gender && (
                        <div className="text-sm">
                          <span className="text-gray-600">Gender:</span>{' '}
                          <span className="font-medium capitalize">{req.gender}</span>
                        </div>
                      )}
                      {req.age_group && (
                        <div className="text-sm">
                          <span className="text-gray-600">Age:</span>{' '}
                          <span className="font-medium">{req.age_group}</span>
                        </div>
                      )}
                      {req.skin_tone && (
                        <div className="text-sm">
                          <span className="text-gray-600">Skin Tone:</span>{' '}
                          <span className="font-medium">{req.skin_tone}</span>
                        </div>
                      )}
                      {req.height && (
                        <div className="text-sm">
                          <span className="text-gray-600">Height:</span>{' '}
                          <span className="font-medium">{req.height}</span>
                        </div>
                      )}
                      {req.subcategory && (
                        <div className="text-sm">
                          <span className="text-gray-600">Category:</span>{' '}
                          <span className="font-medium">{req.subcategory.subcategoryName}</span>
                        </div>
                      )}
                    </div>

                    {req.role_description && (
                      <p className="text-gray-700 text-sm">{req.role_description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {castingCall.additional_notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Additional Notes</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {castingCall.additional_notes}
              </p>
            </div>
          )}

          {/* Documents */}
          {castingCall.media && castingCall.media.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Documents</h2>
              <div className="space-y-2">
                {castingCall.media.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {(doc.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Meta Info */}
        <div className="space-y-6">
          {/* Key Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-gray-900">Key Information</h3>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Deadline:</span>
                <p className="font-medium text-red-600">
                  {format(new Date(castingCall.deadline), 'MMMM dd, yyyy')}
                </p>
              </div>

              {castingCall.audition_date && (
                <div>
                  <span className="text-sm text-gray-600">Audition Date:</span>
                  <p className="font-medium">
                    {format(new Date(castingCall.audition_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}

              {castingCall.location && (
                <div>
                  <span className="text-sm text-gray-600">Location:</span>
                  <p className="font-medium">
                    {castingCall.city && `${castingCall.city}, `}
                    {castingCall.location}
                  </p>
                </div>
              )}

              {castingCall.audition_location && (
                <div>
                  <span className="text-sm text-gray-600">Audition Location:</span>
                  <p className="font-medium">{castingCall.audition_location}</p>
                </div>
              )}

              {castingCall.is_remote_audition && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    Remote Audition Available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Compensation */}
          {castingCall.compensation_type && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Compensation</h3>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{castingCall.compensation_type}</p>
                </div>

                {castingCall.rate_amount && (
                  <div>
                    <span className="text-sm text-gray-600">Rate:</span>
                    <p className="font-medium">
                      {castingCall.rate_currency} {castingCall.rate_amount}
                      {castingCall.rate_period && ` / ${castingCall.rate_period}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-gray-900">Statistics</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-medium">{castingCall.views_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applications</span>
                <span className="font-medium">{castingCall.applications_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Posted</span>
                <span className="font-medium">
                  {format(new Date(castingCall.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Apply Button (if not owner) */}
          {!isOwner && castingCall.status === 'published' && (
            <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}