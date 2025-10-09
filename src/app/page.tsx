import Link from 'next/link';
import { ArrowRight, Search, Users, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find the Perfect{' '}
            <span className="text-primary-600 dark:text-primary-400">
              Talent
            </span>{' '}
            Match
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI-powered talent marketplace connecting skilled professionals with
            exciting opportunities. Smart matching, instant results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-600 bg-white dark:bg-gray-800 dark:text-primary-400 border border-primary-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose Talents You Need?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of talents and recruiters already using our platform
            to find the perfect match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?type=talent"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              I'm a Talent
            </Link>
            <Link
              href="/register?type=recruiter"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary-700 dark:bg-primary-800 border border-primary-500 rounded-lg hover:bg-primary-800 dark:hover:bg-primary-900 transition-colors"
            >
              I'm Hiring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: 'AI-Powered Matching',
    description:
      'Our smart algorithm finds the perfect match based on skills, experience, and project requirements.',
    icon: Zap,
  },
  {
    title: 'Smart Search',
    description:
      'Natural language search understands what you need and delivers relevant results instantly.',
    icon: Search,
  },
  {
    title: 'Verified Talents',
    description:
      'All talents are verified with portfolio reviews and skill assessments for quality assurance.',
    icon: Shield,
  },
  {
    title: 'Large Community',
    description:
      'Join thousands of professionals and companies finding success on our platform daily.',
    icon: Users,
  },
];