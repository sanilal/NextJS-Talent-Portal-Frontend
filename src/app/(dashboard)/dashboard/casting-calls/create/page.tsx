'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  createCastingCall,
  getGenres,
  getAgeGroups,
  getSkinTones,
  getHeights,
  getGenders,
} from '@/lib/api/casting-calls';
import { CreateCastingCallRequest, CastingCallRequirement } from '@/types/casting-calls';

// Import existing API functions
import { getProjectTypes } from '@/lib/api/projects';
import { getCountries, getStates } from '@/lib/api/auth';
import { getSubcategories } from '@/lib/api/talents';
import { talentsAPI } from '@/lib/api/talents';

// Validation schema
const castingCallSchema = z.object({
  // Project Details (Left Column)
  project_type_id: z.string().min(1, 'Project type is required'),
  genre_id: z.string().optional(),
  project_name: z.string().min(1, 'Project name is required'),
  title: z.string().min(1, 'Casting call title is required'),
  director: z.string().optional(),
  production_company: z.string().optional(),
  audition_date: z.string().optional(),
  deadline: z.string().min(1, 'Submission deadline is required'),
  country_id: z.string().min(1, 'Country is required'),
  state_id: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(10, 'Synopsis must be at least 10 characters'),
  additional_notes: z.string().optional(),
  
  // Requirements (Right Column)
  requirements: z.array(
    z.object({
      gender: z.string().optional(),
      age_group: z.string().optional(),
      skin_tone: z.string().optional(),
      height: z.string().optional(),
      subcategory_id: z.string().optional(),
      role_name: z.string().min(1, 'Role is required'),
      role_description: z.string().optional(),
    })
  ).min(1, 'At least one requirement is needed'),
  
  // Additional fields
  compensation_type: z.string().optional(),
  rate_amount: z.string().optional(),
  rate_currency: z.string().default('AED'),
  status: z.enum(['draft', 'published']).default('draft'),
  is_urgent: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

type CastingCallFormData = z.infer<typeof castingCallSchema>;

export default function CreateCastingCallPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // ✅ FIXED: Changed from uploadedFiles to selectedFiles (stores actual File objects)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ✅ FIXED: Fetch categories first
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: talentsAPI.getPublicCategories,
  });

  // Fetch dropdown data
  const { data: projectTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: getProjectTypes,
  });

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

 const { data: countries, isLoading: countriesLoading, error: countriesError } = useQuery({
  queryKey: ['countries'],
  queryFn: getCountries,
});

// ADD THIS DEBUG LOG
console.log('🌍 Countries Debug:', {
  data: countries,
  isLoading: countriesLoading,
  error: countriesError,
  dataLength: countries?.data?.length || 0,
});

  const { data: states } = useQuery({
    queryKey: ['states', selectedCountry],
    queryFn: () => getStates(selectedCountry),
    enabled: !!selectedCountry,
  });

  // ✅ FIXED: Get subcategories based on selected category
  // Only fetch when a category is selected, otherwise use data from categories
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: () => getSubcategories(selectedCategory!),
    enabled: selectedCategory !== null && selectedCategory !== '', // Only fetch when category is selected
  });

  const { data: ageGroups } = useQuery({
    queryKey: ['ageGroups'],
    queryFn: getAgeGroups,
  });

  const { data: skinTones } = useQuery({
    queryKey: ['skinTones'],
    queryFn: getSkinTones,
  });

  const { data: heights } = useQuery({
    queryKey: ['heights'],
    queryFn: getHeights,
  });

  const { data: genders } = useQuery({
    queryKey: ['genders'],
    queryFn: getGenders,
  });

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CastingCallFormData>({
    resolver: zodResolver(castingCallSchema),
    defaultValues: {
      requirements: [
        {
          role_name: '',
          role_description: '',
        },
      ],
      rate_currency: 'AED',
      status: 'draft',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  });

  // Watch country for state dropdown
  const watchCountry = watch('country_id');
  if (watchCountry !== selectedCountry) {
    setSelectedCountry(watchCountry);
  }

  // ✅ FIXED: Update mutation to use fetch with FormData
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Get token from localStorage (adjust based on your auth setup)
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/api/v1/recruiter/casting-calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create casting call');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Casting call created successfully!');
      router.push(`/dashboard/casting-calls/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create casting call');
    },
  });

  // ✅ FIXED: Update onSubmit to build FormData instead of JSON
  const onSubmit = (data: CastingCallFormData) => {
    const formData = new FormData();

    // Add all required fields
    formData.append('project_type_id', data.project_type_id);
    formData.append('project_name', data.project_name);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('deadline', data.deadline);
    formData.append('country_id', data.country_id);
    
    // Add optional fields only if they exist
    if (data.genre_id) formData.append('genre_id', data.genre_id);
    if (data.director) formData.append('director', data.director);
    if (data.production_company) formData.append('production_company', data.production_company);
    if (data.audition_date) formData.append('audition_date', data.audition_date);
    if (data.state_id) formData.append('state_id', data.state_id);
    if (data.city) formData.append('city', data.city);
    if (data.location) formData.append('location', data.location);
    if (data.additional_notes) formData.append('additional_notes', data.additional_notes);
    if (data.compensation_type) formData.append('compensation_type', data.compensation_type);
    if (data.rate_amount) formData.append('rate_amount', data.rate_amount);
    if (data.rate_currency) formData.append('rate_currency', data.rate_currency);
    
    formData.append('status', data.status || 'draft');
    formData.append('is_urgent', data.is_urgent ? '1' : '0');
    formData.append('is_featured', data.is_featured ? '1' : '0');

    // Add requirements as JSON string
    formData.append('requirements', JSON.stringify(data.requirements));

    // ✅ Add actual files
    selectedFiles.forEach((file) => {
      formData.append('media[]', file);
    });

    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Casting Call</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details to create a new casting call
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Project Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 border-b pb-3">
                Project Details
              </h2>

              {/* Project Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('project_type_id')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select project type</option>
                  {projectTypes?.data?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.project_type_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_type_id.message}</p>
                )}
              </div>

              {/* Genre */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  {...register('genre_id')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select genre</option>
                  {genres?.data?.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('project_name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
                {errors.project_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_name.message}</p>
                )}
              </div>

              {/* Casting Call Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Casting Call Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter casting call title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Director */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director
                </label>
                <input
                  type="text"
                  {...register('director')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter director name"
                />
              </div>

              {/* Production Company */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Production Company
                </label>
                <input
                  type="text"
                  {...register('production_company')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter production company"
                />
              </div>

              {/* Audition Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audition Date
                </label>
                <input
                  type="date"
                  {...register('audition_date')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submission Deadline */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('deadline')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                {...register('country_id')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                {countries?.data?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName}  {/* ✅ FIXED */}
                  </option>
                ))}
              </select>
                {errors.country_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.country_id.message}</p>
                )}
              </div>

              {/* State */}
              {selectedCountry && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Region
                  </label>
                  <select
                    {...register('state_id')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {states?.data?.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.stateName}  {/* ✅ FIXED - probably was state.name */}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* City */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              {/* Location Details */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Details
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Studio address, filming location"
                />
              </div>

              {/* Synopsis */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Synopsis/Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Additional Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  {...register('additional_notes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>

              {/* ✅ FIXED: Attach Documents with file preview */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Documents <span className="text-gray-400">(Up to 10 files)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                />
                
                {/* Show selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Selected {selectedFiles.length} file(s):
                    </p>
                    <ul className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded"
                        >
                          <span className="flex items-center">
                            <svg 
                              className="w-4 h-4 mr-2 text-blue-500" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                              />
                            </svg>
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="mt-1 text-sm text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG, MP4, MOV accepted (Max 50MB per file)
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Looking For */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-xl font-semibold text-gray-900">Looking For</h2>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      role_name: '',
                      role_description: '',
                    })
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  + Add Requirement
                </button>
              </div>

              {/* ✅ ADDED: Category Filter (Optional) */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Subcategories by Category (Optional)
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">All Categories</option>
                  {categories?.data?.map((cat: any) => (
                    <option key={cat.category.id} value={cat.category.id}>
                      {cat.category.categoryName}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a category to filter subcategories below
                </p>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700">Requirement #{index + 1}</h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      {...register(`requirements.${index}.gender`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Any</option>
                      {genders?.data?.map((gender) => (
                        <option key={gender.id} value={gender.value.toLowerCase()}>
                          {gender.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Age */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Group
                    </label>
                    <select
                      {...register(`requirements.${index}.age_group`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select age group</option>
                      {ageGroups?.data?.map((age) => (
                        <option key={age.id} value={age.value}>
                          {age.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skin Tone */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skin Tone
                    </label>
                    <select
                      {...register(`requirements.${index}.skin_tone`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Any</option>
                      {skinTones?.data?.map((tone) => (
                        <option key={tone.id} value={tone.value}>
                          {tone.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Height */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <select
                      {...register(`requirements.${index}.height`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Any</option>
                      {heights?.data?.map((height) => (
                        <option key={height.id} value={height.value}>
                          {height.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ✅ FIXED: Subcategory with grouped options */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <select
                      {...register(`requirements.${index}.subcategory_id`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select subcategory</option>
                      {selectedCategory ? (
                        // Show filtered subcategories
                        subcategories?.data?.map((sub: any) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.subcategoryName}
                          </option>
                        ))
                      ) : (
                        // Show all subcategories grouped by category
                        categories?.data?.map((cat: any) => (
                          <optgroup key={cat.category.id} label={cat.category.categoryName}>
                            {cat.category.subcategories.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.subcategoryName}
                              </option>
                            ))}
                          </optgroup>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`requirements.${index}.role_name`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Lead Actor, Supporting Role"
                    />
                    {errors.requirements?.[index]?.role_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.requirements[index]?.role_name?.message}
                      </p>
                    )}
                  </div>

                  {/* Role Description */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Description
                    </label>
                    <textarea
                      {...register(`requirements.${index}.role_description`)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the role requirements..."
                    />
                  </div>
                </div>
              ))}

              {errors.requirements && (
                <p className="mt-2 text-sm text-red-600">{errors.requirements.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Casting Call'}
          </button>
        </div>
      </form>
    </div>
  );
}