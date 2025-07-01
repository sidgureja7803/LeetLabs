import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: "1",
    type: "TEACHER_ASSIGNED",
    description: "Dr. Smith was assigned to Operating Systems",
    timestamp: "2 hours ago",
    user: {
      name: "Dr. Smith",
      initials: "DS",
    },
  },
  {
    id: "2",
    type: "SUBJECT_CREATED",
    description: "New subject 'Data Structures' was created",
    timestamp: "3 hours ago",
    user: {
      name: "Admin",
      initials: "AD",
    },
  },
  {
    id: "3",
    type: "STUDENT_ENROLLED",
    description: "25 students were enrolled in Database Systems",
    timestamp: "5 hours ago",
    user: {
      name: "System",
      initials: "SY",
    },
  },
  {
    id: "4",
    type: "ASSIGNMENT_CREATED",
    description: "New assignment created for Computer Networks",
    timestamp: "1 day ago",
    user: {
      name: "Dr. Johnson",
      initials: "DJ",
    },
  },
  {
    id: "5",
    type: "QUIZ_SCHEDULED",
    description: "Quiz scheduled for Artificial Intelligence",
    timestamp: "1 day ago",
    user: {
      name: "Dr. Brown",
      initials: "DB",
    },
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.description}
            </p>
            <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 