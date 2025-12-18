// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: 'talent' | 'recruiter' | 'admin';
  account_status: 'active' | 'pending_verification' | 'suspended' | 'banned';
  email_verified_at?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  is_email_verified: boolean; // ✅ Added for new flow
  created_at: string;
  updated_at: string;
  // ✅ NEW: Country support
  country_id?: number;
  country?: Country;
  state_id?: number;
  state?: State;
}

// ✅ NEW: Country & State Types
export interface Country {
  id: number;
  name: string;
  code: string;
  phone_code?: string;
  flag?: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  country_id: number;
  country?: Country;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: 'talent' | 'recruiter';
  phone?: string;
  country_id?: number; // ✅ Added for new registration flow
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
}

// ✅ NEW: Email Verification Types
export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
  message: string;
  requires_verification?: boolean; // ✅ For unverified email redirect
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
  requires_verification?: boolean; // ✅ Indicates email verification needed
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  message: string;
  token?: string;
  token_type?: string;
  user?: User;
}

export interface ResendOTPResponse {
  message: string;
  expires_in?: number;
  retry_after?: number;
}

// ============================================
// SKILL TYPES
// ============================================

export interface Skill {
  id: number;
  name: string;
  slug: string;
  category_id?: number;
  category?: Category;
  description?: string;
  icon?: string;
  is_featured: boolean;
  is_active: boolean;
  usage_count: number;
  talents_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface TalentSkill {
  id: number;
  talent_profile_id: number;
  skill_id: number;
  skill?: Skill;
  description?: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  is_verified: boolean;
  image_path?: string;
  image_url?: string;
  video_url?: string;
  is_primary: boolean;
  display_order: number;
  show_on_profile: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// PROFILE TYPES
// ============================================

export interface TalentProfile {
  id: number;
  user_id: number;
  user?: User;
  primary_category_id?: number;
  professional_title?: string;
  summary?: string;
  experience_level: 'entry' | 'junior' | 'intermediate' | 'senior' | 'expert';
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  currency: string;
  availability_types?: string[];
  is_available: boolean;
  work_preferences?: Record<string, any>;
  preferred_locations?: string[];
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  is_featured: boolean;
  is_public: boolean;
  profile_views: number;
  average_rating?: number;
  total_ratings: number;
  profile_completion_percentage: number;
  
  // Relations
  skills?: TalentSkill[];
  experiences?: Experience[];
  education?: Education[];
  portfolios?: Portfolio[];
  
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  industry?: string;
}

export interface Experience {
  id: number;
  talent_profile_id: number;
  title: string;
  company: string;
  location?: string;
  is_current: boolean;
  start_date: string;
  end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: number;
  talent_profile_id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: number;
  talent_profile_id: number;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  video_url?: string;
  external_url?: string;
  project_date?: string;
  is_featured: boolean;
  display_order: number;
  skills?: Skill[];
  created_at: string;
  updated_at: string;
}

// ============================================
// REVIEW & STATS TYPES
// ============================================

export interface Review {
  id: number;
  talent_profile_id: number;
  reviewer_id: number;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: {
    name: string;
    avatar?: string;
    company?: string;
  };
}

export interface TalentStats {
  total_projects: number;
  total_reviews: number;
  average_rating: number;
  response_time?: string;
  completion_rate?: number;
}

// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled' | 'closed';
  budget_min?: number;
  budget_max?: number;
  budget_currency: string;
  duration?: number;
  duration_unit?: 'hours' | 'days' | 'weeks' | 'months';
  location?: string;
  is_remote: boolean;
  experience_level: 'entry' | 'junior' | 'intermediate' | 'senior' | 'expert';
  project_type: 'fixed' | 'hourly' | 'contract' | 'full-time';
  start_date?: string;
  end_date?: string;
  application_deadline?: string;
  recruiter_id: number;
  recruiter?: User;
  category?: Category;
  skills?: Skill[];
  applications_count?: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency: string;
  duration?: number;
  duration_unit?: string;
  location?: string;
  is_remote: boolean;
  experience_level: string;
  project_type: string;
  start_date?: string;
  application_deadline?: string;
  category_id?: number;
  skill_ids?: number[];
}

// ============================================
// APPLICATION TYPES
// ============================================

export interface Application {
  id: number;
  project_id: number;
  talent_profile_id: number;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  proposed_rate?: number;
  proposed_duration?: number;
  availability_date?: string;
  project?: Project;
  talent?: TalentProfile;
  notes?: ApplicationNote[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationNote {
  id: number;
  application_id: number;
  user_id: number;
  note: string;
  created_at: string;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  talents_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface TalentFilters {
  search?: string;
  skills?: number[];
  skill_ids?: number[];
  category_id?: number;
  experience_level?: string | string[];
  availability_status?: string | string[];
  availability_types?: string[];
  min_rate?: number;
  max_rate?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  languages?: string[];
  is_featured?: boolean;
  is_available?: boolean;
  sort_by?: 'created_at' | 'hourly_rate_min' | 'average_rating' | 'profile_views' | 'name';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface SearchFilters {
  experience_level?: string[];
  availability?: string[];
  location?: string[];
  is_remote?: boolean;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  skills?: number[];
  category_id?: number;
}

export interface SearchParams {
  query?: string;
  filters?: SearchFilters;
  limit?: number;
  page?: number;
}

export interface SearchResult<T> {
  data: T[];
  meta?: PaginationMeta;
}

// ============================================
// AI MATCHING TYPES
// ============================================

export interface MatchResult {
  talent?: TalentProfile;
  project?: Project;
  similarity_score: number;
  matching_skills?: Skill[];
  reasons?: string[];
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface TalentProfileResponse {
  success: boolean;
  data: {
    talent: TalentProfile;
    stats: TalentStats;
  };
}

export interface TalentListResponse {
  success: boolean;
  data: PaginatedResponse<TalentProfile>;
}

// ============================================
// TALENT SKILLS API PAYLOADS
// ============================================

export interface CreateTalentSkillPayload {
  skill_id: number;
  description?: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  image?: File;
  video_url?: string;
  is_primary?: boolean;
  display_order?: number;
  show_on_profile?: boolean;
}

export interface UpdateTalentSkillPayload extends Partial<CreateTalentSkillPayload> {
  _method?: 'PUT';
}

export interface ReorderSkillsPayload {
  skills: Array<{
    id: number;
    display_order: number;
  }>;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  type: string;
  data: any;
  read_at?: string;
  created_at: string;
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
  total_projects?: number;
  active_projects?: number;
  total_applications?: number;
  pending_applications?: number;
  total_messages?: number;
  unread_messages?: number;
  profile_completeness?: number;
  total_views?: number;
}

// ============================================
// FORM ERROR TYPES
// ============================================

export interface FormErrors {
  [key: string]: string;
}