import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import MentorStudentsConsole from "@/components/mentor-students-console";

export default async function MentorStudentsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "MENTOR" || !session.mentorId) {
    redirect("/login");
  }

  // Fetch students, batch, program, projects, and Kanban tasks
  const students = await prisma.student.findMany({
    where: {
      batch: {
        mentorId: session.mentorId
      }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      batch: {
        select: {
          batchCode: true
        }
      },
      program: {
        select: {
          id: true,
          title: true
        }
      },
      certificates: {
        select: {
          id: true,
          certificateNumber: true
        }
      },
      submissions: true,
      attendance: {
        orderBy: {
          date: "desc"
        }
      },
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
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: {
          deadline: "asc"
        }
      }
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Mentees Console</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Inspect student profiles, track batch alignments, and evaluate project Kanban board items.
        </p>
      </div>

      <MentorStudentsConsole students={JSON.parse(JSON.stringify(students))} />
    </div>
  );
}
