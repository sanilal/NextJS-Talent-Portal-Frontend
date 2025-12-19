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
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false); // ✅ NEW STATE
  const [existingEmail, setExistingEmail] = useState(''); // ✅ STORE THE EMAIL
  
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

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/public/countries');
        const apiData = response.data?.data || [];
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          const transformedCountries: Country[] = apiData.map((item: any) => ({
            id: item.id,
            name: item.countryName,
            countryCode: item.countryCode,
            dialing_code: item.dialing_code,
          }));
          
          setCountries(transformedCountries);
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
  }, []);

  // Set user type from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recruiter' || type === 'talent') {
      setValue('user_type', type);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    console.log('📋 Submitting registration:', data);
    
    // Reset email exists state
    setEmailAlreadyExists(false);
    setExistingEmail('');

    const result = await register(data);

    if (result.success) {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } else {
      // ✅ CHECK IF ERROR IS "EMAIL ALREADY EXISTS"
      const validationErrors = result.validationErrors;
      
      if (validationErrors?.email) {
        const emailErrors = Array.isArray(validationErrors.email) 
          ? validationErrors.email 
          : [validationErrors.email];
        
        // Check if any error message contains "already been taken" or "already exists"
        const isEmailTaken = emailErrors.some(msg => 
          msg.toLowerCase().includes('already been taken') ||
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('already registered')
        );
        
        if (isEmailTaken) {
          console.log('✅ Email already exists - showing login prompt');
          setEmailAlreadyExists(true);
          setExistingEmail(data.email);
          return; // Don't show error toast, show the UI component instead
        }
      }
      
      // ✅ FOR OTHER VALIDATION ERRORS, SHOW THEM AS TOASTS
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => {
              // Format field name nicely
              const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              toast.error(`${fieldName}: ${msg}`);
            });
          } else {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            toast.error(`${fieldName}: ${messages}`);
          }
        });
      } else {
        // Generic error
        const errorMessage = result.error?.message || 
                            result.error?.errors || 
                            'Registration failed. Please try again.';
        toast.error(errorMessage);
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
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Create your account
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Join our community of talented professionals
            </p>
          </div>

          {/* ✅ EMAIL ALREADY EXISTS ALERT */}
          {emailAlreadyExists && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
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
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      <Mail className="h-4 w-4" />
                      Sign In Instead
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/auth/forgot-password"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      setEmailAlreadyExists(false);
                      setExistingEmail('');
                    }}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form - Hide when showing email exists alert */}
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
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Briefcase className={`h-8 w-8 mb-2 ${
                        userType === 'talent' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        userType === 'talent' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Talent
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Find opportunities</span>
                      {userType === 'talent' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue('user_type', 'recruiter')}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        userType === 'recruiter'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <User className={`h-8 w-8 mb-2 ${
                        userType === 'recruiter' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        userType === 'recruiter' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Recruiter
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hire talent</span>
                      {userType === 'recruiter' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerField('first_name')}
                        id="first_name"
                        type="text"
                        autoComplete="given-name"
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                        placeholder="John"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerField('last_name')}
                        id="last_name"
                        type="text"
                        autoComplete="family-name"
                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerField('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerField('phone')}
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                      placeholder="+971 52 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...registerField('country_id')}
                      id="country_id"
                      disabled={loadingCountries}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a country...</option>
                      {countries.map((country) => (
                        <option key={`country-${country.id}`} value={country.id}>
                          {country.name} ({country.dialing_code})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {errors.country_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country_id.message}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerField('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerField('password_confirmation')}
                        id="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation.message}</p>
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
                  className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in →
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading registration form...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}