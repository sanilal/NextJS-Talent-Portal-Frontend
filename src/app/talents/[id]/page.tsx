'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/axios';
import { useParams, useRouter } from 'next/navigation';

export default function TalentProfile() {
  const params = useParams();
  const router = useRouter();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchTalentProfile();
  }, [params.id]);

  const fetchTalentProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/public/talents/${params.id}`);
      setTalent(response.data);
    } catch (error) {
      console.error('Error fetching talent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Talent not found</h2>
          <button
            onClick={() => router.push('/talents')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Talent Directory
          </button>
        </div>
      </div>
    );
  }

  const profile = talent.talentProfile || talent.talent_profile;
  const experiences = talent.experiences || [];
  const education = talent.education || [];
  const portfolios = talent.portfolios || [];
  const skills = talent.skills || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/talents')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Talent Directory
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {/* Could add cover photo here */}
          </div>
          
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              {profile?.avatar_url ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${profile.avatar_url}`}
                  alt={talent.first_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-4xl text-gray-600">
                  {talent.first_name?.charAt(0)}{talent.last_name?.charAt(0)}
                </div>
              )}
              
              {/* Availability Badge */}
              {profile?.is_available && (
                <div className="absolute bottom-2 right-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow">
                  Available
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {talent.first_name} {talent.last_name}
                </h1>
                {profile?.professional_title && (
                  <p className="text-xl text-gray-600 mb-3">
                    {profile.professional_title}
                  </p>
                )}
                
                {/* Location */}
                {talent.location && (
                  <p className="text-gray-500 flex items-center gap-2">
                    📍 {talent.location}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                >
                  Contact
                </button>
                <button
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-6 py-6 border-t border-b">
              <div>
                <p className="text-sm text-gray-500 mb-1">Experience</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {profile?.experience_level || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile?.hourly_rate_min && profile?.hourly_rate_max
                    ? `$${profile.hourly_rate_min} - $${profile.hourly_rate_max}`
                    : 'Negotiable'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Projects</p>
                <p className="text-lg font-semibold text-gray-900">
                  {talent.completed_projects || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                  ⭐ {profile?.average_rating ? profile.average_rating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Summary */}
            {profile?.summary && (
              <Section title="About">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {profile.summary}
                </p>
              </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skillItem: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skillItem.skill?.name || skillItem.name}
                      {skillItem.proficiency_level && (
                        <span className="ml-2 text-xs opacity-75">
                          ({skillItem.proficiency_level})
                        </span>
                      )}
                    </span>
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
                        {exp.job_title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {exp.company_name} • {exp.employment_type}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed">
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
                    <div key={edu.id}>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {edu.degree} in {edu.field_of_study}
                      </h3>
                      <p className="text-gray-600">
                        {edu.institution_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edu.start_date} - {edu.end_date || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Portfolio */}
            {portfolios.length > 0 && (
              <Section title="Portfolio">
                <div className="grid grid-cols-2 gap-4">
                  {portfolios.map((item: any) => (
                    <div
                      key={item.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      {item.thumbnail_url && (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.thumbnail_url}`}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Availability Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profile?.is_available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {profile?.is_available ? 'Available' : 'Not Available'}
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
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {talent.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-900">{talent.email}</p>
                  </div>
                )}
                {talent.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm text-gray-900">{talent.phone}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send Message
              </button>
            </div>

            {/* Languages */}
            {profile?.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="space-y-2">
                  {profile.languages.map((lang: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{lang.language}</span>
                      <span className="text-xs text-gray-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          talent={talent}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      {children}
    </div>
  );
}

function ContactModal({ talent, onClose }: any) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
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
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Contact {talent.first_name}
        </h3>
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