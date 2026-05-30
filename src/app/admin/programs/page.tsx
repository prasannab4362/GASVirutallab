import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import ProgramsManager from "@/components/programs-manager";

export default async function AdminProgramsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch programs with batches and mentors
  const programs = await prisma.program.findMany({
    include: {
      batches: {
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
          }
        },
        orderBy: {
          startDate: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Curriculum Console</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Publish learning tracks, schedule cohort dates, and link mentors to active study batches.
        </p>
      </div>

      <ProgramsManager 
        programs={JSON.parse(JSON.stringify(programs))} 
        mentors={JSON.parse(JSON.stringify(mentors))} 
      />
    </div>
  );
}
