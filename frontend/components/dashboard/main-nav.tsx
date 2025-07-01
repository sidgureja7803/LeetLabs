import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="flex items-center space-x-2"
      >
        <span className="hidden font-bold sm:inline-block">
          Thapar Virtual Labs
        </span>
      </Link>
    </nav>
  );
} 