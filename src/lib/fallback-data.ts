/**
 * Fallback data for registration form
 * This matches the actual API structure from the backend
 */

export const FALLBACK_CATEGORIES = [
  {
    id: '86ee4960-2a1f-4034-af86-c3912dd23993',
    name: 'Artist',
    slug: 'artist',
    description: 'Actors, models, singers, and performers',
  },
  {
    id: '590cbd02-9a32-4975-9d5b-8ec5fd67009c',
    name: 'Crew',
    slug: 'crew',
    description: 'Technical and creative crew members',
  },
  {
    id: '62ce60a5-a03d-4c31-8702-13fa209c2f3e',
    name: 'Vendor',
    slug: 'vendor',
    description: 'Equipment, locations, and services',
  },
  {
    id: 'd6de65ca-3a79-4860-9272-436c500fbeb8',
    name: 'Wedding Filmmaker',
    slug: 'wedding-filmmaker',
    description: 'Wedding and event professionals',
  },
];

export const FALLBACK_COUNTRIES = [
  { id: 1, name: 'Afghanistan', countryCode: 'AF', dialing_code: '+93' },
  { id: 2, name: 'Albania', countryCode: 'AL', dialing_code: '+355' },
  { id: 3, name: 'Algeria', countryCode: 'DZ', dialing_code: '+213' },
  { id: 4, name: 'Argentina', countryCode: 'AR', dialing_code: '+54' },
  { id: 5, name: 'Australia', countryCode: 'AU', dialing_code: '+61' },
  { id: 6, name: 'Austria', countryCode: 'AT', dialing_code: '+43' },
  { id: 7, name: 'Bahrain', countryCode: 'BH', dialing_code: '+973' },
  { id: 8, name: 'Bangladesh', countryCode: 'BD', dialing_code: '+880' },
  { id: 9, name: 'Belgium', countryCode: 'BE', dialing_code: '+32' },
  { id: 10, name: 'Brazil', countryCode: 'BR', dialing_code: '+55' },
  { id: 11, name: 'Canada', countryCode: 'CA', dialing_code: '+1' },
  { id: 12, name: 'China', countryCode: 'CN', dialing_code: '+86' },
  { id: 13, name: 'Egypt', countryCode: 'EG', dialing_code: '+20' },
  { id: 14, name: 'France', countryCode: 'FR', dialing_code: '+33' },
  { id: 15, name: 'Germany', countryCode: 'DE', dialing_code: '+49' },
  { id: 16, name: 'India', countryCode: 'IN', dialing_code: '+91' },
  { id: 17, name: 'Indonesia', countryCode: 'ID', dialing_code: '+62' },
  { id: 18, name: 'Iran', countryCode: 'IR', dialing_code: '+98' },
  { id: 19, name: 'Iraq', countryCode: 'IQ', dialing_code: '+964' },
  { id: 20, name: 'Israel', countryCode: 'IL', dialing_code: '+972' },
  { id: 21, name: 'Italy', countryCode: 'IT', dialing_code: '+39' },
  { id: 22, name: 'Japan', countryCode: 'JP', dialing_code: '+81' },
  { id: 23, name: 'Jordan', countryCode: 'JO', dialing_code: '+962' },
  { id: 24, name: 'Kuwait', countryCode: 'KW', dialing_code: '+965' },
  { id: 25, name: 'Lebanon', countryCode: 'LB', dialing_code: '+961' },
  { id: 26, name: 'Malaysia', countryCode: 'MY', dialing_code: '+60' },
  { id: 27, name: 'Mexico', countryCode: 'MX', dialing_code: '+52' },
  { id: 28, name: 'Morocco', countryCode: 'MA', dialing_code: '+212' },
  { id: 29, name: 'Netherlands', countryCode: 'NL', dialing_code: '+31' },
  { id: 30, name: 'New Zealand', countryCode: 'NZ', dialing_code: '+64' },
  { id: 31, name: 'Nigeria', countryCode: 'NG', dialing_code: '+234' },
  { id: 32, name: 'Norway', countryCode: 'NO', dialing_code: '+47' },
  { id: 33, name: 'Oman', countryCode: 'OM', dialing_code: '+968' },
  { id: 34, name: 'Pakistan', countryCode: 'PK', dialing_code: '+92' },
  { id: 35, name: 'Palestine', countryCode: 'PS', dialing_code: '+970' },
  { id: 36, name: 'Philippines', countryCode: 'PH', dialing_code: '+63' },
  { id: 37, name: 'Qatar', countryCode: 'QA', dialing_code: '+974' },
  { id: 38, name: 'Russia', countryCode: 'RU', dialing_code: '+7' },
  { id: 39, name: 'Saudi Arabia', countryCode: 'SA', dialing_code: '+966' },
  { id: 40, name: 'Singapore', countryCode: 'SG', dialing_code: '+65' },
  { id: 41, name: 'South Africa', countryCode: 'ZA', dialing_code: '+27' },
  { id: 42, name: 'South Korea', countryCode: 'KR', dialing_code: '+82' },
  { id: 43, name: 'Spain', countryCode: 'ES', dialing_code: '+34' },
  { id: 44, name: 'Sri Lanka', countryCode: 'LK', dialing_code: '+94' },
  { id: 45, name: 'Sweden', countryCode: 'SE', dialing_code: '+46' },
  { id: 46, name: 'Switzerland', countryCode: 'CH', dialing_code: '+41' },
  { id: 47, name: 'Syria', countryCode: 'SY', dialing_code: '+963' },
  { id: 48, name: 'Thailand', countryCode: 'TH', dialing_code: '+66' },
  { id: 49, name: 'Turkey', countryCode: 'TR', dialing_code: '+90' },
  { id: 50, name: 'United Arab Emirates', countryCode: 'AE', dialing_code: '+971' },
  { id: 51, name: 'United Kingdom', countryCode: 'GB', dialing_code: '+44' },
  { id: 52, name: 'United States', countryCode: 'US', dialing_code: '+1' },
  { id: 53, name: 'Vietnam', countryCode: 'VN', dialing_code: '+84' },
  { id: 54, name: 'Yemen', countryCode: 'YE', dialing_code: '+967' },
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Country {
  id: number;
  name: string;
  countryCode: string;
  dialing_code: string;
}