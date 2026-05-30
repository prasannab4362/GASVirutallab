import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import MentorsManager from "@/components/mentors-manager";

export default async function AdminMentorsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch mentors list
  const mentors = await prisma.mentor.findMany({
    include: {
      user: true,
      batches: {
        select: {
          batchCode: true
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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Mentors Console</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Register new industry mentors, audit cohort alignments, and view contact profiles.
        </p>
      </div>

      <MentorsManager mentors={JSON.parse(JSON.stringify(mentors))} />
    </div>
  );
}
