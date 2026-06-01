import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import StudentResourcesConsole from "@/components/student-resources-console";
import BatchChatInterface from "@/components/batch-chat-interface";

export default async function StudentAssignmentsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT" || !session.studentId) {
    redirect("/login");
  }

  // Fetch full student record with batch and assignments
  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      batch: {
        include: {
          assignments: {
            where: { status: "ACTIVE" },
            orderBy: { deadline: "asc" }
          },
          studyMaterials: {
            orderBy: { createdAt: "desc" }
          }
        }
      },
      submissions: true
    }
  });

  if (!student) {
    redirect("/login");
  }

  const assignments = student.batch?.assignments || [];
  const submissions = student.submissions || [];
  const materials = student.batch?.studyMaterials || [];
  const batchId = student.batch?.id;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Workspace Resources & Chat</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Access study materials, submit assignments, and communicate with your mentor in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <StudentResourcesConsole 
            assignments={JSON.parse(JSON.stringify(assignments))} 
            submissions={JSON.parse(JSON.stringify(submissions))} 
            materials={JSON.parse(JSON.stringify(materials))}
          />
        </div>
        
        <div className="xl:col-span-1">
          {batchId ? (
            <BatchChatInterface 
              batchId={batchId} 
              currentUserId={session.userId} 
            />
          ) : (
            <div className="p-8 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              You are not assigned to a batch yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
