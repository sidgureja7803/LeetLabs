import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/");
  }

  return <div className="student-dashboard-layout">{children}</div>;
}
