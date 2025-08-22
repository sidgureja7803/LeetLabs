import { AuthNavbar } from "@/components/layout/AuthNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
