'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function AuthNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Thapar Virtual Labs"
              width={40}
              height={40}
              className="h-10 w-10"
              onError={(e) => {
                e.currentTarget.src = '/favicon.ico';
              }}
            />
            <span className="font-bold text-xl hidden md:inline-block">Thapar Virtual Labs</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/about' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            About
          </Link>
          <Link 
            href="/team" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/team' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Team
          </Link>
          <Link 
            href="/contact" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/contact' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {pathname !== '/login' && (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
          {pathname !== '/signup' && (
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
