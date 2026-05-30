import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import ReviewsList from "@/components/reviews-list";
import { AlertCircle, CheckSquare } from "lucide-react";

export default async function MentorReviewsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "MENTOR" || !session.mentorId) {
    redirect("/login");
  }

  // Load all submissions for assignments belonging to the mentor's batches
  const submissions = await prisma.submission.findMany({
    where: {
      assignment: {
        batch: {
          mentorId: session.mentorId
        }
      }
    },
    include: {
      assignment: true,
      student: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Submission Evaluations</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Review challenge notebooks, check code files, assign grades, and write pedagogical feedback for student submissions.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <CheckSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Submissions Found</h3>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
            Students in your cohort have not submitted any assignments or tasks yet.
          </p>
        </div>
      ) : (
        <ReviewsList initialSubmissions={JSON.parse(JSON.stringify(submissions))} />
      )}
    </div>
  );
}
