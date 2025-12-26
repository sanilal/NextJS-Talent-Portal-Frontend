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
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Fetch dropdown data
  const { data: projectTypes } = useQuery({
    queryKey: ['projectTypes'],
    queryFn: getProjectTypes,
  });

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const { data: states } = useQuery({
    queryKey: ['states', selectedCountry],
    queryFn: () => getStates(selectedCountry),
    enabled: !!selectedCountry,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => getSubcategories(1), // Assuming CategoryId 1 for talents
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCastingCall,
    onSuccess: (data) => {
      toast.success('Casting call created successfully!');
      router.push(`/dashboard/casting-calls/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create casting call');
    },
  });

  const onSubmit = (data: CastingCallFormData) => {
    const payload: CreateCastingCallRequest = {
      ...data,
      rate_amount: data.rate_amount ? parseFloat(data.rate_amount) : undefined,
      media_ids: uploadedFiles.map((f) => f.id),
    };

    createMutation.mutate(payload);
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
                  placeholder="Director name"
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
                  placeholder="Production company name"
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

              {/* Last Date of Submission */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Date of Submission <span className="text-red-500">*</span>
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
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.country_id.message}</p>
                )}
              </div>

              {/* State/Province */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State / Province
                </label>
                <select
                  {...register('state_id')}
                  disabled={!selectedCountry}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select state</option>
                  {states?.data?.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* Synopsis */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Synopsis <span className="text-red-500">*</span>
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
                  Additional Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  {...register('additional_notes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Attach Documents */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Documents <span className="text-gray-400">(Up to 10 files)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    // Handle file upload - integrate with your media upload API
                    console.log('Files selected:', e.target.files);
                  }}
                />
                <p className="mt-1 text-sm text-gray-500">PDF, DOC, DOCX accepted</p>
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

                  {/* Subcategory */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <select
                      {...register(`requirements.${index}.subcategory_id`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select subcategory</option>
                      {subcategories?.data?.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.subcategoryName}
                        </option>
                      ))}
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