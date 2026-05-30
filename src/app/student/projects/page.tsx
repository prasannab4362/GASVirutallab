import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import StudentProjectsConsole from "@/components/student-projects-console";
import { Briefcase } from "lucide-react";

export default async function StudentProjectsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT" || !session.studentId) {
    redirect("/login");
  }

  // Fetch student and projects with tasks
  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      projects: {
        include: {
          mentor: {
            select: {
              id: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          tasks: {
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { deadline: "asc" }
      }
    }
  });

  if (!student) {
    redirect("/login");
  }

  // Fetch all registered mentors
  const mentors = await prisma.mentor.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  const projects = student.projects || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Project Pipeline</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Track milestones, view objectives, add self-directed pipelines, and update Kanban task board items.
        </p>
      </div>

      <StudentProjectsConsole 
        initialProjects={JSON.parse(JSON.stringify(projects))} 
        mentors={JSON.parse(JSON.stringify(mentors))} 
      />
    </div>
  );
}
