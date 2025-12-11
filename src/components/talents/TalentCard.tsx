import Link from 'next/link';
import { MapPin, DollarSign, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, truncate } from '@/lib/utils';
import type { TalentProfile } from '@/types';

interface TalentCardProps {
  talent: TalentProfile & { similarity_score?: number };
  showSimilarityScore?: boolean;
}

export function TalentCard({ talent, showSimilarityScore }: TalentCardProps) {
  // ✅ Helper to get location string from preferred_locations array
  const getLocation = () => {
    if (talent.preferred_locations && talent.preferred_locations.length > 0) {
      return talent.preferred_locations[0];
    }
    return 'Location not specified';
  };

  // ✅ Helper to check if remote work is available from availability_types
  const isRemoteAvailable = () => {
    if (talent.availability_types && talent.availability_types.length > 0) {
      return talent.availability_types.some(type => 
        type.toLowerCase().includes('remote')
      );
    }
    return false;
  };

  // ✅ Get availability status from is_available boolean
  const getAvailabilityStatus = () => {
    return talent.is_available ? 'available' : 'not_available';
  };

  return (
    <Link href={`/dashboard/talents/${talent.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-xl flex-shrink-0">
              {talent.user?.first_name?.charAt(0)}{talent.user?.last_name?.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {talent.user?.first_name} {talent.user?.last_name}
              </h3>
              {/* ✅ FIXED: Use professional_title instead of title */}
              {talent.professional_title && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {talent.professional_title}
                </p>
              )}
              {/* ✅ FIXED: Use average_rating and total_ratings instead of rating_average and rating_count */}
              {talent.average_rating && talent.total_ratings > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {talent.average_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({talent.total_ratings})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {/* ✅ FIXED: Use summary instead of bio */}
          {talent.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
              {truncate(talent.summary, 120)}
            </p>
          )}

          {/* Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {talent.skills.slice(0, 4).map((talentSkill) => (
                <span
                  key={talentSkill.id}
                  className="px-2 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded"
                >
                  {talentSkill.skill?.name}
                </span>
              ))}
              {talent.skills.length > 4 && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  +{talent.skills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="space-y-2">
            {/* Hourly Rate */}
            {/* ✅ FIXED: Use hourly_rate_min and currency instead of hourly_rate and hourly_rate_currency */}
            {talent.hourly_rate_min && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatCurrency(talent.hourly_rate_min, talent.currency)}/hr
                  {/* Show range if max is different */}
                  {talent.hourly_rate_max && talent.hourly_rate_max !== talent.hourly_rate_min && (
                    <> - {formatCurrency(talent.hourly_rate_max, talent.currency)}/hr</>
                  )}
                </span>
              </div>
            )}

            {/* Location */}
            {/* ✅ FIXED: Use helper functions for location and remote availability */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {isRemoteAvailable() ? 'Remote Available' : getLocation()}
              </span>
            </div>

            {/* Experience Level */}
            {talent.experience_level && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${talent.experience_level === 'expert' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' : ''}
                  ${talent.experience_level === 'senior' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  ${talent.experience_level === 'intermediate' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                  ${talent.experience_level === 'junior' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
                  ${talent.experience_level === 'entry' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' : ''}
                `}>
                  {talent.experience_level.charAt(0).toUpperCase() + talent.experience_level.slice(1)} Level
                </span>
              </div>
            )}
          </div>

          {/* AI Similarity Score */}
          {showSimilarityScore && talent.similarity_score && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  AI Match Score
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">
                    {Math.round(talent.similarity_score * 100)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${talent.similarity_score * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Availability Badge */}
          {/* ✅ FIXED: Use is_available boolean instead of availability string */}
          <div className="mt-4">
            <span className={`
              inline-flex px-2 py-1 text-xs font-medium rounded-full
              ${talent.is_available ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}
            `}>
              {talent.is_available ? 'Available Now' : 'Not Available'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}