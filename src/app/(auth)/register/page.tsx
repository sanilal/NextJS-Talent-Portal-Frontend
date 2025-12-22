'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Mail, Lock, Phone, Eye, EyeOff, Briefcase, Sparkles, ArrowRight, Globe, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PublicRoute } from '@/components/auth/PublicRoute';
import api from '@/lib/api/axios';
import { FALLBACK_COUNTRIES, type Country } from '@/lib/fallback-data';

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  password_confirmation: z.string(),
  user_type: z.enum(['talent', 'recruiter']),
  country_id: z.string().min(1, 'Please select a country'),
  phone: z.string().optional(),
  phone_country_id: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false);
  const [existingEmail, setExistingEmail] = useState('');
  
  // ✅ FIXED: Use direct state for phone country ID
  const [phoneCountryId, setPhoneCountryId] = useState<string>('');
  
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register: registerField,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: 'talent',
    },
  });

  const userType = watch('user_type');
  const selectedCountryId = watch('country_id');

  // ✅ Get selected phone country details
  const selectedPhoneCountry = countries.find(c => c.id === phoneCountryId);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/public/countries');
        const apiData = response.data?.data || [];
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          const transformedCountries: Country[] = apiData.map((item: any) => ({
            id: item.id.toString(), // ✅ Ensure ID is string
            name: item.countryName,
            countryCode: item.countryCode,
            dialing_code: item.dialing_code,
          }));
          
          setCountries(transformedCountries);
          
          // ✅ Set default phone country to UAE
          const defaultCountry = transformedCountries.find(c => c.countryCode === 'AE');
          if (defaultCountry) {
            setPhoneCountryId(defaultCountry.id);
            setValue('phone_country_id', defaultCountry.id);
          }
        } else {
          setCountries(FALLBACK_COUNTRIES);
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        setCountries(FALLBACK_COUNTRIES);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [setValue]);

  // ✅ Auto-set phone country when residence country changes (only if not manually set)
  useEffect(() => {
    if (selectedCountryId && countries.length > 0 && !phoneCountryId) {
      const country = countries.find(c => c.id === selectedCountryId);
      if (country) {
        setPhoneCountryId(country.id);
        setValue('phone_country_id', country.id);
      }
    }
  }, [selectedCountryId, countries, phoneCountryId, setValue]);

  // Set user type from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recruiter' || type === 'talent') {
      setValue('user_type', type);
    }
  }, [searchParams, setValue]);

  // ✅ FIXED: Handle phone country change
  const handlePhoneCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    console.log('📱 Phone country changed to:', countryId);
    setPhoneCountryId(countryId);
    setValue('phone_country_id', countryId);
  };

  const onSubmit = async (data: RegisterFormData) => {
    console.log('📋 Submitting registration:', data);
    
    setEmailAlreadyExists(false);
    setExistingEmail('');

    const result = await register(data);

    if (result.success) {
      toast.success('Registration successful!');
     // router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      router.push(`/login?email=${encodeURIComponent(data.email)}`);
    } else {
      const validationErrors = result.validationErrors;
      
      if (validationErrors?.email) {
        const emailErrors = Array.isArray(validationErrors.email) 
          ? validationErrors.email 
          : [validationErrors.email];
        
        const isEmailTaken = emailErrors.some(msg => 
          msg.toLowerCase().includes('already been taken') ||
          msg.toLowerCase().includes('already exists')
        );
        
        if (isEmailTaken) {
          setEmailAlreadyExists(true);
          setExistingEmail(data.email);
          return;
        }
      }
      
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => {
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              toast.error(`${fieldName}: ${msg}`);
            });
          }
        });
      } else {
        toast.error(result.error?.message || 'Registration failed');
      }
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl">
                  <Sparkles className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Join our community of talented professionals
            </p>
          </div>

          {/* Email Already Exists Alert */}
          {emailAlreadyExists && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Account Already Exists
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    An account with <strong>{existingEmail}</strong> is already registered.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/login?email=${encodeURIComponent(existingEmail)}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Sign In Instead
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      setEmailAlreadyExists(false);
                      setExistingEmail('');
                    }}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!emailAlreadyExists && (
            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    I want to register as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue('user_type', 'talent')}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        userType === 'talent'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Briefcase className={`h-8 w-8 mb-2 ${
                        userType === 'talent' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        userType === 'talent' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Talent
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue('user_type', 'recruiter')}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        userType === 'recruiter'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <User className={`h-8 w-8 mb-2 ${
                        userType === 'recruiter' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        userType === 'recruiter' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Recruiter
                      </span>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      {...registerField('first_name')}
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      {...registerField('last_name')}
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    {...registerField('email')}
                    type="email"
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Country (Residence) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country (Where you live)
                  </label>
                  <select
                    {...registerField('country_id')}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={loadingCountries}
                  >
                    <option value="">Select country...</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.country_id.message}</p>
                  )}
                </div>

                {/* ✅ FIXED: Phone Number with Working Country Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {/* Phone Country Dropdown */}
                    <div className="col-span-2">
                      <select
                        value={phoneCountryId}
                        onChange={handlePhoneCountryChange}
                        className="w-full px-2 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        disabled={loadingCountries}
                      >
                        {countries.map((country) => (
                          <option key={country.id} value={country.id}>
                            {country.dialing_code} {country.countryCode}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number Input */}
                    <div className="col-span-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {selectedPhoneCountry?.dialing_code || '+'}
                          </span>
                        </div>
                        <input
                          {...registerField('phone')}
                          type="tel"
                          className="w-full pl-16 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="52 723 2144"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select country code from dropdown, then enter your number
                  </p>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('password_confirmation')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Password must contain:
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}