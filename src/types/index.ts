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
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  // Country support
  country_id?: number;
  country?: Country;
  state_id?: number;
  state?: State;
}

// Country & State Types
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
  country_id?: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
}

// Email Verification Types
export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
  message: string;
  requires_verification?: boolean;
}

export interface RegisterResponse {
  message: string;
  user?: User;
  token?: string;
  requires_verification?: boolean;
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  name: string;
  slug: string;
  category_id?: string; // ✅ FIXED: Changed from number to string (UUID)
  category?: Category;
  subcategory_id?: string;
  subcategory?: Subcategory;
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

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category_id?: string;
}

export interface TalentSkill {
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
  skill_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  user_id: string; // ✅ FIXED: Changed from number to string (UUID)
  user?: User;
  primary_category_id?: string; // ✅ FIXED: Changed from number to string (UUID)
  professional_title?: string;
  summary?: string;
  experience_level: 'entry' | 'intermediate' | 'advanced' | 'expert'; // ✅ FIXED: Removed 'junior' and 'senior'
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
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
  reviewer_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  recruiter_profile_id: string; // ✅ FIXED: Added
  posted_by: string; // ✅ FIXED: Added
  title: string;
  slug: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  deliverables?: string[];
  
  // ✅ FIXED: Project type fields
  project_type_id: number; // Film/TV project type
  primary_category_id?: string; // UUID for talent category
  
  // ✅ FIXED: Work type (renamed from is_remote)
  work_type?: 'on_site' | 'remote' | 'hybrid';
  
  // ✅ FIXED: Budget fields (renamed from project_type)
  budget_type?: 'fixed' | 'hourly' | 'daily' | 'negotiable';
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string; // Default: AED
  budget_negotiable?: boolean;
  
  // Dates
  duration?: number; // in days
  project_start_date?: string; // ✅ Renamed from start_date
  project_end_date?: string; // ✅ Renamed from end_date
  application_deadline?: string;
  
  location?: string;
  experience_level?: 'entry' | 'intermediate' | 'advanced' | 'expert'; // ✅ FIXED: Updated options
  skills_required?: string[]; // Array of skill UUIDs
  positions_available?: number;
  
  // Status & Visibility
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'; // ✅ FIXED: Updated statuses
  visibility?: 'public' | 'private' | 'invited_only';
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  
  // Features
  is_featured?: boolean;
  requires_portfolio?: boolean;
  requires_demo_reel?: boolean;
  application_questions?: string[];
  
  // Relations
  recruiter?: RecruiterProfile;
  applications?: Application[];
  
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ProjectType {
  id: number;
  name: string;
  projectTypeName: string;
  postRequestTypes: string;
  slug: string;
  description: string | null;
  icon: string | null;
  orderType: number;
  sort_order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ FIXED: Updated ProjectFormData to match new schema
export interface ProjectFormData {
  title: string;
  description: string;
  project_type_id: number; // ✅ REQUIRED: Film/TV type
  primary_category_id?: string; // UUID for talent category
  work_type?: 'on_site' | 'remote' | 'hybrid'; // ✅ Changed from is_remote
  budget_type?: 'fixed' | 'hourly' | 'daily' | 'negotiable'; // ✅ Renamed from project_type
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string; // Default: AED
  budget_negotiable?: boolean;
  duration?: number; // in days
  project_start_date?: string; // ✅ Renamed from start_date
  project_end_date?: string; // ✅ Renamed from end_date
  application_deadline?: string;
  location?: string;
  experience_level?: 'entry' | 'intermediate' | 'advanced' | 'expert'; // ✅ Fixed options
  skills_required?: string[]; // Array of skill UUIDs
  requirements?: string;
  responsibilities?: string;
  deliverables?: string;
  positions_available?: number;
  visibility?: 'public' | 'private' | 'invited_only';
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  is_featured?: boolean;
  requires_portfolio?: boolean;
  requires_demo_reel?: boolean;
  application_questions?: string[];
}

// ============================================
// APPLICATION TYPES
// ============================================

export interface Application {
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  project_id: string; // ✅ FIXED: Changed from number to string (UUID)
  talent_profile_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  application_id: string; // ✅ FIXED: Changed from number to string (UUID)
  user_id: string; // ✅ FIXED: Changed from number to string (UUID)
  note: string;
  created_at: string;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  name: string;
  categoryName?: string; // Backend compatibility
  slug: string;
  description?: string;
  parent_id?: string; // ✅ FIXED: Changed from number to string (UUID)
  icon?: string;
  color?: string;
  talents_count?: number;
  is_active: boolean;
  sort_order?: number;
  subcategories?: Subcategory[];
  created_at: string;
  updated_at: string;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface TalentFilters {
  search?: string;
  skills?: string[]; // ✅ FIXED: Changed from number[] to string[] (UUIDs)
  skill_ids?: string[]; // ✅ FIXED: Changed from number[] to string[] (UUIDs)
  category_id?: string; // ✅ FIXED: Changed from number to string (UUID)
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
  work_type?: 'on_site' | 'remote' | 'hybrid'; // ✅ FIXED: Changed from is_remote
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  skills?: string[]; // ✅ FIXED: Changed from number[] to string[] (UUIDs)
  category_id?: string; // ✅ FIXED: Changed from number to string (UUID)
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
  skill_id: string; // ✅ FIXED: Changed from number to string (UUID)
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
    id: string; // ✅ FIXED: Changed from number to string (UUID)
    display_order: number;
  }>;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string; // ✅ FIXED: Changed from number to string (UUID)
  sender_id: string; // ✅ FIXED: Changed from number to string (UUID)
  receiver_id: string; // ✅ FIXED: Changed from number to string (UUID)
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

// ============================================
// CASTING CALLS TYPES
// Re-exported from casting-calls.ts for convenience
// ============================================

export * from './casting-calls';