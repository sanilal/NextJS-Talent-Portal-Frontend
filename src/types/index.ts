// User & Authentication Types
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
  created_at: string;
  updated_at: string;
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
  date_of_birth?: string;
  gender?: string;
}

// Project Types
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

// Talent Profile Types
export interface TalentProfile {
  id: number;
  user_id: number;
  user?: User;
  title?: string;
  bio?: string;
  hourly_rate?: number;
  hourly_rate_currency: string;
  availability: 'available' | 'busy' | 'not_available';
  experience_level: 'entry' | 'junior' | 'intermediate' | 'senior' | 'expert';
  location?: string;
  is_remote_available: boolean;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  skills?: TalentSkill[];
  experiences?: Experience[];
  education?: Education[];
  portfolios?: Portfolio[];
  rating_average?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

// Skill Types
export interface Skill {
  id: number;
  name: string;
  slug: string;
  category?: Category;
  description?: string;
}

export interface TalentSkill {
  id: number;
  skill_id: number;
  skill?: Skill;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
}

// Experience Types
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
}

// Education Types
export interface Education {
  id: number;
  talent_profile_id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  created_at: string;
}

// Portfolio Types
export interface Portfolio {
  id: number;
  talent_profile_id: number;
  title: string;
  description?: string;
  url?: string;
  image_url?: string;
  project_date?: string;
  skills?: Skill[];
  created_at: string;
}

// Application Types
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

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon?: string;
}

// Search Types
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

// AI Matching Types
export interface MatchResult {
  talent?: TalentProfile;
  project?: Project;
  similarity_score: number;
  matching_skills?: Skill[];
  reasons?: string[];
}

// Pagination Types
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Message Types
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

// Notification Types
export interface Notification {
  id: string;
  type: string;
  data: any;
  read_at?: string;
  created_at: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_projects?: number;
  active_projects?: number;
  total_applications?: number;
  pending_applications?: number;
  total_messages?: number;
  unread_messages?: number;
  profile_completeness?: number;
}