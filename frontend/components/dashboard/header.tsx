import Link from "next/link";
import { UserNav } from "@/components/dashboard/user-nav";
import { MainNav } from "@/components/dashboard/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";

interface SiteHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <UserNav user={user} />
          </nav>
        </div>
      </div>
    </header>
  );
} 