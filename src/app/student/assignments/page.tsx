import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import AssignmentList from "@/components/assignment-list";
import { AlertCircle, FileCheck } from "lucide-react";

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Cohort Tasks</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Review assignment criteria, submit project notebooks, and inspect feedback scores from your cohort mentors.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <FileCheck className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Assignments Scheduled</h3>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
            There are currently no assignments or challenge notebooks published for your cohort batch.
          </p>
        </div>
      ) : (
        <AssignmentList 
          assignments={JSON.parse(JSON.stringify(assignments))} 
          submissions={JSON.parse(JSON.stringify(submissions))} 
        />
      )}
    </div>
  );
}
