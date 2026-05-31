import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import MentorAssignmentsConsole from "@/components/mentor-assignments-console";

export default async function MentorAssignmentsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "MENTOR" || !session.mentorId) {
    redirect("/login");
  }

  // Fetch batches belonging to this mentor
  const batches = await prisma.batch.findMany({
    where: { mentorId: session.mentorId },
    include: {
      program: { select: { title: true } },
      students: { select: { id: true } }
    }
  });

  const batchIds = batches.map(b => b.id);

  // Fetch assignments created for these batches
  const assignments = await prisma.assignment.findMany({
    where: { batchId: { in: batchIds } },
    include: {
      batch: { select: { batchCode: true } },
      submissions: {
        include: {
          student: {
            include: { user: { select: { name: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Batch Assignments</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Create assignments for your batches and track intern submissions.
        </p>
      </div>

      <MentorAssignmentsConsole 
        batches={JSON.parse(JSON.stringify(batches))} 
        assignments={JSON.parse(JSON.stringify(assignments))} 
      />
    </div>
  );
}
