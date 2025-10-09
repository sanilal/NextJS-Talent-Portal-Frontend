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
              {talent.title && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {talent.title}
                </p>
              )}
              {talent.rating_average && talent.rating_count && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {talent.rating_average.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({talent.rating_count})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {talent.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
              {truncate(talent.bio, 120)}
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
            {talent.hourly_rate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatCurrency(talent.hourly_rate, talent.hourly_rate_currency)}/hr
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {talent.is_remote_available ? 'Remote Available' : talent.location || 'On-site'}
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
          {talent.availability && (
            <div className="mt-4">
              <span className={`
                inline-flex px-2 py-1 text-xs font-medium rounded-full
                ${talent.availability === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                ${talent.availability === 'busy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : ''}
                ${talent.availability === 'not_available' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
              `}>
                {talent.availability === 'available' && 'Available Now'}
                {talent.availability === 'busy' && 'Currently Busy'}
                {talent.availability === 'not_available' && 'Not Available'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}