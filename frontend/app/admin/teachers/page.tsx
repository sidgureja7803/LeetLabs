import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminAPI } from "@/lib/api";
import { User } from "@/lib/types";

export const metadata: Metadata = {
  title: "Manage Teachers",
  description: "View and manage teachers in your department.",
};

async function fetchTeachers(): Promise<User[]> {
  try {
    const res = await adminAPI.getTeachers();
    return res.data?.data?.teachers || [];
  } catch (e) {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await fetchTeachers();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Teachers List</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <div className="text-muted-foreground">No teachers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Employee ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{teacher.firstName} {teacher.lastName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{teacher.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{teacher.employeeId}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{teacher.department?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 