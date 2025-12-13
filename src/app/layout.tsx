import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Talents You Need - AI-Powered Talent Marketplace',
  description: 'Connect with top talent through intelligent AI-powered matching. Find the perfect fit for your project or discover your next opportunity.',
  keywords: ['talent marketplace', 'AI matching', 'freelance', 'recruitment', 'jobs'],
  authors: [{ name: 'Talents You Need' }],
  openGraph: {
    title: 'Talents You Need - AI-Powered Talent Marketplace',
    description: 'Connect with top talent through intelligent AI-powered matching',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}