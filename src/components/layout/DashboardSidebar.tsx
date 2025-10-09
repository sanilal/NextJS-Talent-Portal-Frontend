'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Search, 
  Users,
  Star,
  Settings,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const talentLinks = [
    { href: '/dashboard/talent', label: 'Dashboard', icon: Home },
    { href: '/dashboard/projects', label: 'Browse Projects', icon: Search },
    { href: '/dashboard/applications', label: 'My Applications', icon: FileText },
    { href: '/dashboard/profile', label: 'My Profile', icon: Users },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const recruiterLinks = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: Home },
    { href: '/dashboard/projects', label: 'My Projects', icon: Briefcase },
    { href: '/dashboard/talents', label: 'Find Talents', icon: Search },
    { href: '/dashboard/applications', label: 'Applications', icon: FileText },
    { href: '/dashboard/saved', label: 'Saved Talents', icon: Star },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  ];

  const links = user?.user_type === 'recruiter' ? recruiterLinks : talentLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Menu
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard/settings'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* User Type Badge */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase">
                {user?.user_type} Account
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}