'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar,
  Briefcase,
  User,
  Mail,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  Star,
  Eye,
  CheckCircle,
  FileText,
  Video,
  Sparkles,
  Building2,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { projectsAPI } from '@/lib/api/projects';
import api from '@/lib/api/axios';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Project } from '@/types';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const projectId = resolvedParams.id;

  // Fetch project details
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      console.log('🔍 Fetching project:', projectId);
      const result = await projectsAPI.getRecruiterProject(projectId);
      console.log('📦 API Response:', result);
      return result;
    },
  });

  // Extract project from response.data
  const project = response?.data;

  // Check if user has already applied
  const { data: hasApplied } = useQuery({
    queryKey: ['has-applied', projectId],
    queryFn: async () => {
      if (user?.user_type !== 'talent') return false;
      const response = await api.get(`/talent/applications?project_id=${projectId}`);
      return response.data.data.length > 0;
    },
    enabled: !!user && user.user_type === 'talent',
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectsAPI.deleteProject(projectId),
    onSuccess: () => {
      toast.success('Project deleted successfully');
      router.push('/dashboard/projects');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('❌ Error loading project:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error Loading Project
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {(error as any)?.response?.data?.message || 'Failed to load project'}
        </p>
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Project not found
        </h2>
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === project.posted_by || user?.recruiterProfile?.id === project.recruiter_profile_id;
  const isTalent = user?.user_type === 'talent';

  // Helper function to format work type
  const getWorkTypeDisplay = (workType: string) => {
    const types: Record<string, string> = {
      'on_site': 'On-Site',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return types[workType] || workType;
  };

  // Helper function to format budget type
  const getBudgetTypeDisplay = (budgetType: string) => {
    const types: Record<string, string> = {
      'fixed': 'Fixed Price',
      'hourly': 'Hourly Rate',
      'daily': 'Daily Rate',
      'negotiable': 'Negotiable'
    };
    return types[budgetType] || budgetType;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      {/* Header with Badges */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {project.title}
            </h1>
            
            {/* Status Badge */}
            <span className={`
              px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap
              ${project.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
              ${project.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
              ${project.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            `}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>

            {/* Featured Badge */}
            {project.is_featured && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Featured
              </span>
            )}

            {/* Urgent Badge */}
            {project.urgency === 'urgent' && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Urgent
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted {formatDate(project.created_at, 'PPP')}
            </span>
            
            {project.category && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {project.category.name}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {project.visibility === 'public' ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isOwner && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/projects/edit/${project.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}

          {isTalent && !hasApplied && project.status === 'published' && (
            <Button
              size="lg"
              onClick={() => router.push(`/dashboard/projects/${project.id}/apply`)}
            >
              Apply Now
            </Button>
          )}

          {isTalent && hasApplied && (
            <Button size="lg" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              Already Applied
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {project.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ul className="space-y-2 list-none pl-0">
                    {project.requirements.split('\n').filter(Boolean).map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {project.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ul className="space-y-2 list-none pl-0">
                    {project.responsibilities.split('\n').filter(Boolean).map((resp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="h-5 w-5 flex items-center justify-center bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {project.deliverables && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <ul className="space-y-2 list-none pl-0">
                    {project.deliverables.split('\n').filter(Boolean).map((deliv: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-primary-600 dark:text-primary-400 font-medium flex-shrink-0">→</span>
                        <span>{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Required */}
          {project.skills && project.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Skills Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: any) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Requirements */}
          
          {(project.requires_portfolio || project.requires_demo_reel) && (
            <Card className="border-orange-200 dark:border-orange-900/20 bg-orange-50/50 dark:bg-orange-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  Submission Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.requires_portfolio && (
                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Portfolio required</span>
                    </div>
                  )}
                  {project.requires_demo_reel && (
                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">Demo reel required</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <Card className="border-primary-200 dark:border-primary-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Key Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget */}
              {(project.budget_min || project.budget_max) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Budget
                    </p>
                  </div>
                  <div className="pl-7">
                    <p className="text-base font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(project.budget_min, project.budget_currency)} - {formatCurrency(project.budget_max, project.budget_currency)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {getBudgetTypeDisplay(project.budget_type)}
                      {project.budget_negotiable ? ' • Negotiable' : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

              {/* Project Type */}
              {project.project_type && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{project.project_type.icon}</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Project Type
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7">
                    {project.project_type.name}
                  </p>
                </div>
              )}

              {/* Experience Level */}
              {project.experience_level && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Experience Level
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7 capitalize">
                    {project.experience_level}
                  </p>
                </div>
              )}

              {/* Work Type */}
              {project.work_type && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Work Type
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7">
                    {getWorkTypeDisplay(project.work_type)}
                  </p>
                </div>
              )}

              {/* Location */}
              {project.location && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Location
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7">
                    {project.location}
                  </p>
                </div>
              )}

              {/* Positions Available */}
              {project.positions_available && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Positions Available
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7">
                    {project.positions_available} {project.positions_available === 1 ? 'position' : 'positions'}
                  </p>
                </div>
              )}

              {/* Duration */}
              {project.duration && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Duration
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pl-7">
                    {project.duration} months
                  </p>
                </div>
              )}

              {/* Project Dates */}
              {(project.project_start_date || project.project_end_date) && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  {project.project_start_date && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Start Date
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(project.project_start_date, 'PPP')}
                      </p>
                    </div>
                  )}

                  {project.project_end_date && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        End Date
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(project.project_end_date, 'PPP')}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Application Deadline */}
              {project.application_deadline && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-1 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/20">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      Application Deadline
                    </p>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      {formatDate(project.application_deadline, 'PPP')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Company/Recruiter Info */}
          {project.recruiter_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Posted By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Name */}
                {project.recruiter_profile.company_name && (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.recruiter_profile.company_name}
                    </p>
                    {project.recruiter_profile.industry && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.recruiter_profile.industry}
                      </p>
                    )}
                  </div>
                )}

                {/* User Info */}
                {project.recruiter_profile.user && (
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-lg">
                      {project.recruiter_profile.user.first_name?.charAt(0)}
                      {project.recruiter_profile.user.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.recruiter_profile.user.first_name} {project.recruiter_profile.user.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Recruiter
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Button */}
                {!isOwner && (
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Recruiter
                  </Button>
                )}

                {/* Company Stats */}
                {project.recruiter_profile.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Verified Company</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Applications
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {project.applications_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  Views
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {project.views_count || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}