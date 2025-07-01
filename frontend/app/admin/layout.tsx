import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { SiteHeader } from "@/components/dashboard/header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <SiteHeader user={session.user} />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav
            items={[
              {
                title: "Overview",
                href: "/admin",
                icon: "dashboard",
              },
              {
                title: "Teachers",
                href: "/admin/teachers",
                icon: "users",
              },
              {
                title: "Subjects",
                href: "/admin/subjects",
                icon: "book",
              },
              {
                title: "Departments",
                href: "/admin/departments",
                icon: "building",
              },
              {
                title: "Settings",
                href: "/admin/settings",
                icon: "settings",
              },
            ]}
          />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 