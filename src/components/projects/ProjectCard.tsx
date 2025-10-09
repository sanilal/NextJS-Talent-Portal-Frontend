import Link from 'next/link';
import { MapPin, Clock, DollarSign, Calendar, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateRelative, formatCurrency, truncate } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {project.title}
              </h3>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
                ${project.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
                ${project.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                ${project.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
              `}>
                {project.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {truncate(project.description, 120)}
            </p>
          </div>

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded"
                >
                  {skill.name}
                </span>
              ))}
              {project.skills.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  +{project.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Meta Information */}
          <div className="space-y-2 mb-4">
            {/* Budget */}
            {project.budget_min && project.budget_max && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatCurrency(project.budget_min, project.budget_currency)} - {formatCurrency(project.budget_max, project.budget_currency)}
                </span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {project.is_remote ? 'Remote' : project.location || 'On-site'}
              </span>
            </div>

            {/* Experience Level */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{project.experience_level}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {project.applications_count !== undefined && (
                <span>{project.applications_count} applications</span>
              )}
              {project.views_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {project.views_count}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDateRelative(project.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}