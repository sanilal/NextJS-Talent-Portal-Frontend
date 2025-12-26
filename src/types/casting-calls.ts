// Casting Call Types

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CastingCallRequirement {
  id?: string;
  casting_call_id?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'any';
  age_group?: string;
  skin_tone?: string;
  height?: string;
  subcategory_id?: string;
  subcategory?: {
    id: string;
    subcategoryName: string;
    CategoryId: number;
  };
  role_name: string;
  role_description?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CastingCall {
  id: string;
  recruiter_id: string;
  recruiter?: {
    id: string;
    user_id: string;
    company_name?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  
  // Project Details
  project_type_id: string;
  projectType?: {
    id: string;
    name: string;
    slug: string;
  };
  genre_id?: string;
  genre?: Genre;
  project_name: string;
  title: string;
  director?: string;
  production_company?: string;
  
  // Location
  country_id: string;
  country?: {
    id: string;
    name: string;
    code: string;
  };
  state_id?: string;
  state?: {
    id: string;
    name: string;
    country_id: string;
  };
  city?: string;
  location?: string;
  
  // Descriptions
  description: string;
  synopsis?: string;
  additional_notes?: string;
  
  // Audition Details
  audition_date?: string;
  audition_location?: string;
  is_remote_audition: boolean;
  audition_script?: string;
  audition_duration_seconds?: number;
  submission_requirements?: string[];
  
  // Dates
  deadline: string;
  
  // Compensation
  compensation_type?: 'paid' | 'unpaid' | 'deferred' | 'tbd';
  rate_amount?: number;
  rate_currency?: string;
  rate_period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'project';
  
  // Status & Visibility
  status: 'draft' | 'published' | 'closed';
  visibility: 'public' | 'private';
  is_featured: boolean;
  is_urgent: boolean;
  
  // Stats
  views_count: number;
  applications_count: number;
  
  // Legacy fields (if still needed)
  role_name?: string;
  role_type?: string;
  gender_required?: string;
  age_min?: number;
  age_max?: number;
  ethnicity_preferences?: string[];
  required_skills?: string[];
  
  // Relationships
  requirements: CastingCallRequirement[];
  media?: Array<{
    id: string;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateCastingCallRequest {
  // Project Details
  project_type_id: string;
  genre_id?: string;
  project_name: string;
  title: string;
  director?: string;
  production_company?: string;
  
  // Location
  country_id: string;
  state_id?: string;
  city?: string;
  location?: string;
  
  // Descriptions
  description: string;
  synopsis?: string;
  additional_notes?: string;
  
  // Dates
  audition_date?: string;
  deadline: string;
  
  // Audition
  audition_location?: string;
  is_remote_audition?: boolean;
  audition_script?: string;
  audition_duration_seconds?: number;
  submission_requirements?: string[];
  
  // Compensation
  compensation_type?: 'paid' | 'unpaid' | 'deferred' | 'tbd';
  rate_amount?: number;
  rate_currency?: string;
  rate_period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'project';
  
  // Status
  status?: 'draft' | 'published';
  visibility?: 'public' | 'private';
  is_featured?: boolean;
  is_urgent?: boolean;
  
  // Requirements
  requirements: Omit<CastingCallRequirement, 'id' | 'casting_call_id' | 'created_at' | 'updated_at'>[];
  
  // Media
  media_ids?: string[];
}

export interface UpdateCastingCallRequest extends Partial<CreateCastingCallRequest> {
  requirements?: CastingCallRequirement[];
}

export interface CastingCallFilters {
  genre_id?: string;
  project_type_id?: string;
  location?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  search?: string;
  status?: 'draft' | 'published' | 'closed';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CastingCallsResponse {
  success: boolean;
  message: string;
  data: {
    data: CastingCall[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface CastingCallResponse {
  success: boolean;
  message: string;
  data: CastingCall;
}

// Dropdown value types for casting calls
export interface DropdownValue {
  id: number;
  type: number;
  value: string;
  display_order?: number;
  is_active?: boolean;
}

export interface DropdownValuesResponse {
  status: number;
  message: string;
  type?: number;
  data: DropdownValue[];
}