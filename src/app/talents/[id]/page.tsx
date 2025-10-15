'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  Mail,
  Globe,
  Calendar,
  Award,
  Eye,
  ArrowLeft,
  ExternalLink,
  Play,
  Image as ImageIcon,
  Phone,
  Linkedin,
  Github,
  Globe as WebIcon,
} from 'lucide-react';
import { api } from '@/lib/api/axios';

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const talentId = params.id as string;
  const [showContactModal, setShowContactModal] = useState(false);

  // Try to use React Query if available, fallback to useState
  const queryResult = useQuery({
    queryKey: ['public-talent', talentId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/public/talents/${talentId}`);
      return response.data;
    },
    enabled: !!talentId,
  });

  // Fallback state for environments without React Query
  const [fallbackData, setFallbackData] = useState<any>(null);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  useEffect(() => {
    // Only use fallback if React Query is not working
    if (!queryResult.data && !queryResult.isLoading) {
      fetchTalentProfile();
    }
  }, [talentId, queryResult.data, queryResult.isLoading]);

  const fetchTalentProfile = async () => {
    try {
      setFallbackLoading(true);
      const response = await api.get(`/api/v1/public/talents/${talentId}`);
      setFallbackData(response.data);
    } catch (error) {
      console.error('Error fetching talent:', error);
    } finally {
      setFallbackLoading(false);
    }
  };

  const data = queryResult.data || fallbackData;
  const isLoading = queryResult.isLoading || fallbackLoading;
  const error = queryResult.error;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Talent Not Found</h2>
          <p className="text-gray-600 mb-4">The talent profile you're looking for doesn't exist.</p>
          <Link
            href="/talents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  // Handle both response structures: { data: { talent, stats } } or direct talent object
  const talent = data.data?.talent || data;
  const stats = data.data?.stats || data.stats || {};
  const profile = talent.talentProfile || talent.talent_profile || talent;
  
  const experiences = talent.experiences || [];
  const education = talent.education || [];
  const portfolios = talent.portfolios || [];
  const skills = talent.skills || [];
  
  const primarySkill = skills.find((s: any) => s.is_primary);
  const visibleSkills = skills.filter((s: any) => s.show_on_profile !== false);

  const availabilityConfig = {
    available: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Available for Work' },
    busy: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Currently Busy' },
    not_available: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Available' },
  };

  const isAvailable = profile?.is_available || profile?.availability === 'available';
  const availability = availabilityConfig[isAvailable ? 'available' : 'not_available'];

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        {/* Could add cover image here */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 -mt-24 relative z-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${profile.avatar_url}`}
                    alt={talent.first_name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto md:mx-0"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl text-white font-bold mx-auto md:mx-0">
                    {talent.first_name?.charAt(0)}{talent.last_name?.charAt(0)}
                  </div>
                )}
                
                {/* Availability Badge on Avatar */}
                {isAvailable && (
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {talent.first_name} {talent.last_name}
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">
                      {profile?.professional_title || primarySkill?.skill?.name || 'Professional'}
                    </p>
                    {talent.location && (
                      <p className="text-gray-500 flex items-center gap-2 mt-2 justify-center md:justify-start">
                        <MapPin className="w-4 h-4" />
                        {talent.location}
                      </p>
                    )}
                  </div>

                  {/* Availability Badge */}
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${availability.color}`}>
                    {availability.label}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 p-6 bg-gray-50 rounded-lg">
                  {(profile?.hourly_rate_min || profile?.hourly_rate) && (
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        ${profile?.hourly_rate_min || profile?.hourly_rate}
                        {profile?.hourly_rate_max && profile.hourly_rate_max !== profile.hourly_rate_min &&
                          `-$${profile.hourly_rate_max}`
                        }
                      </p>
                    </div>
                  )}

                  {profile?.experience_level && (
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-semibold text-gray-900 text-lg capitalize">
                        {profile.experience_level}
                      </p>
                    </div>
                  )}

                  {(profile?.average_rating || profile?.rating_average) && (
                    <div className="text-center md:text-left">
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-semibold text-gray-900 text-lg flex items-center gap-1 justify-center md:justify-start">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {(profile.average_rating || profile.rating_average).toFixed(1)}
                        <span className="text-sm text-gray-500">
                          ({profile.total_ratings || profile.rating_count || 0})
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="text-center md:text-left">
                    <p className="text-sm text-gray-600">Projects</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {stats.total_projects || talent.completed_projects || 0}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2 shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Talent
                  </button>
                  <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pb-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {profile?.summary && (
                <Section title="About">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {profile.summary}
                  </p>
                </Section>
              )}

              {/* Skills */}
              {visibleSkills.length > 0 && (
                <Section title="Skills & Expertise">
                  <div className="grid grid-cols-1 gap-4">
                    {visibleSkills
                      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                      .map((skillItem: any) => (
                        <div
                          key={skillItem.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {skillItem.skill?.icon && (
                                <span className="text-2xl">{skillItem.skill.icon}</span>
                              )}
                              <h3 className="font-semibold text-gray-900">
                                {skillItem.skill?.name || skillItem.name}
                                {skillItem.is_primary && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Primary
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            {skillItem.proficiency_level && (
                              <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                                {skillItem.proficiency_level}
                              </span>
                            )}
                            {skillItem.years_of_experience && (
                              <span>{skillItem.years_of_experience}+ years</span>
                            )}
                          </div>

                          {skillItem.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {skillItem.description}
                            </p>
                          )}

                          {skillItem.certifications && skillItem.certifications.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {skillItem.certifications.map((cert: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                                >
                                  <Award className="w-3 h-3" />
                                  {cert.name || cert}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Skill Media */}
                          {(skillItem.image_url || skillItem.video_url) && (
                            <div className="mt-3 flex gap-2">
                              {skillItem.image_url && (
                                <a
                                  href={skillItem.image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                  View Work
                                </a>
                              )}
                              {skillItem.video_url && (
                                <a
                                  href={skillItem.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <Play className="w-3 h-3" />
                                  Watch Demo
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </Section>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <Section title="Work Experience">
                  <div className="space-y-6">
                    {experiences.map((exp: any) => (
                      <div key={exp.id} className="border-l-2 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.title || exp.job_title}
                        </h3>
                        <p className="text-gray-600">
                          {exp.company || exp.company_name}
                          {exp.employment_type && ` • ${exp.employment_type}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {exp.start_date}
                          {' - '}
                          {exp.is_current ? 'Present' : exp.end_date || 'Present'}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-2 whitespace-pre-line leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Education */}
              {education.length > 0 && (
                <Section title="Education">
                  <div className="space-y-4">
                    {education.map((edu: any) => (
                      <div key={edu.id} className="border-l-2 border-purple-500 pl-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {edu.degree}
                          {edu.field_of_study && ` in ${edu.field_of_study}`}
                        </h3>
                        <p className="text-gray-600">
                          {edu.institution || edu.institution_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {edu.start_date}
                          {' - '}
                          {edu.is_current ? 'Present' : edu.end_date || 'Present'}
                        </p>
                        {edu.description && (
                          <p className="text-gray-700 mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Portfolio */}
              {portfolios.length > 0 && (
                <Section title="Portfolio">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolios
                      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                      .map((item: any) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors group cursor-pointer"
                        >
                          {(item.image_url || item.thumbnail_url) && (
                            <img
                              src={
                                item.image_url?.startsWith('http')
                                  ? item.image_url
                                  : `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image_url || item.thumbnail_url}`
                              }
                              alt={item.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {(item.url || item.external_url) && (
                              <a
                                href={item.url || item.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-3"
                              >
                                View Project
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {talent.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900 break-all">{talent.email}</p>
                      </div>
                    </div>
                  )}
                  {talent.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{talent.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </div>

              {/* Social Links */}
              {(profile?.linkedin_url || profile?.github_url || profile?.website_url || profile?.portfolio_url) && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Links</h3>
                  <div className="space-y-2">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {(profile.website_url || profile.portfolio_url) && (
                      <a
                        href={profile.website_url || profile.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <WebIcon className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile?.languages && profile.languages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Languages</h3>
                  <div className="space-y-2">
                    {profile.languages.map((lang: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {typeof lang === 'string' ? lang : lang.language}
                        </span>
                        {typeof lang !== 'string' && lang.proficiency && (
                          <span className="text-xs text-gray-500 capitalize">{lang.proficiency}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  {profile?.notice_period && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notice Period</span>
                      <span className="text-sm font-medium text-gray-900">
                        {profile.notice_period} days
                      </span>
                    </div>
                  )}
                  {stats.response_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stats.response_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <span className="font-semibold text-gray-900">
                      {profile?.profile_views || 0}
                    </span>
                  </div>
                  {(stats.total_projects || talent.completed_projects) && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Projects Completed</span>
                      <span className="font-semibold text-gray-900">
                        {stats.total_projects || talent.completed_projects}
                      </span>
                    </div>
                  )}
                  {stats.total_reviews && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="font-semibold text-gray-900">
                        {stats.total_reviews}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Completion */}
              {profile?.profile_completion_percentage && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Profile Completion</h3>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {profile.profile_completion_percentage}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${profile.profile_completion_percentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since{' '}
                    {new Date(talent.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal talent={talent} onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

function ContactModal({ talent, onClose }: { talent: any; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      await api.post('/api/v1/messages', {
        recipient_id: talent.id,
        message: message,
      });
      alert('Message sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Contact {talent.first_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}