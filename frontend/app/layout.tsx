import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Thapar Virtual Labs - Digital Learning Platform',
  description: 'A comprehensive virtual laboratory platform for Thapar Institute of Engineering and Technology students, teachers, and administrators.',
  keywords: ['virtual labs', 'education', 'thapar university', 'engineering', 'learning platform'],
  authors: [{ name: 'Thapar Institute of Engineering and Technology' }],
  creator: 'Thapar Institute of Engineering and Technology',
  publisher: 'Thapar Institute of Engineering and Technology',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://labs.thapar.edu',
    title: 'Thapar Virtual Labs',
    description: 'Digital Learning Platform for Engineering Education',
    siteName: 'Thapar Virtual Labs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thapar Virtual Labs',
    description: 'Digital Learning Platform for Engineering Education',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 