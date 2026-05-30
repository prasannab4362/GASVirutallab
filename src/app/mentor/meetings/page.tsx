import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import MeetingsManager from "@/components/meetings-manager";

export default async function MentorMeetingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "MENTOR" || !session.mentorId) {
    redirect("/login");
  }

  // Load all batches associated with this mentor
  const mentor = await prisma.mentor.findUnique({
    where: { id: session.mentorId },
    include: {
      batches: {
        select: {
          id: true,
          batchCode: true
        }
      },
      meetings: {
        include: {
          batch: {
            select: {
              batchCode: true
            }
          }
        },
        orderBy: { date: "desc" }
      }
    }
  });

  if (!mentor) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Cohort Live Syncs</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Create live study calls, link Teams/Zoom credentials, and document previous session audits for your mentees.
        </p>
      </div>

      <MeetingsManager 
        batches={mentor.batches} 
        initialMeetings={JSON.parse(JSON.stringify(mentor.meetings))} 
      />
    </div>
  );
}
