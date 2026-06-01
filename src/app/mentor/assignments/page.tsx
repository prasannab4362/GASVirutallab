import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import MentorResourcesConsole from "@/components/mentor-resources-console";
import BatchChatInterface from "@/components/batch-chat-interface";

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

  // Fetch study materials created for these batches
  const materials = await prisma.studyMaterial.findMany({
    where: { batchId: { in: batchIds } },
    include: {
      batch: { select: { batchCode: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workspace Resources & Chat</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Upload study materials, manage batch assignments, and communicate with your interns in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <MentorResourcesConsole 
            batches={JSON.parse(JSON.stringify(batches))} 
            assignments={JSON.parse(JSON.stringify(assignments))} 
            materials={JSON.parse(JSON.stringify(materials))}
          />
        </div>
        
        <div className="xl:col-span-1">
          {batches.length > 0 ? (
            <BatchChatInterface 
              batchId={batches[0].id} 
              currentUserId={session.userId} 
            />
          ) : (
            <div className="p-8 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              No batches assigned yet to open chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
