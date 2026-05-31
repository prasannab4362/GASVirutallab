import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { 
  Users, 
  Layers, 
  CheckSquare, 
  Calendar, 
  Clock, 
  Video, 
  AlertCircle,
  ArrowRight,
  UserCheck,
  TrendingUp,
  FileCheck
} from "lucide-react";
import Link from "next/link";

export default async function MentorDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "MENTOR" || !session.mentorId) {
    redirect("/login");
  }

  // Fetch mentor with batches and meetings
  const mentor = await prisma.mentor.findUnique({
    where: { id: session.mentorId },
    include: {
      batches: {
        include: {
          students: true,
          assignments: true
        }
      },
      meetings: {
        where: {
          date: { gte: new Date(Date.now() - 60 * 60 * 1000) } // started in last hour or future
        },
        orderBy: { date: "asc" },
        take: 1
      }
    }
  });

  if (!mentor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-950">Mentor Profile Incomplete</h2>
        <p className="text-zinc-500 text-sm mt-2 max-w-sm">
          Your account is registered, but your mentor profile file is missing. Please contact platform administration.
        </p>
      </div>
    );
  }

  // Calculate metrics
  const totalCohorts = mentor.batches.length;
  const totalMentees = mentor.batches.reduce((sum, b) => sum + b.students.length, 0);
  
  const pendingReviewsCount = await prisma.submission.count({
    where: {
      status: "SUBMITTED",
      assignment: {
        batch: {
          mentorId: mentor.id
        }
      }
    }
  });

  const upcomingMeeting = mentor.meetings[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg border border-zinc-800">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mentor Console</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hello, Mentor {session.name}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Review deliverables, schedule cohort discussions, and guide your mentees on their educational path.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Cohorts */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Active Cohorts</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalCohorts}</span>
            <span className="text-xs text-zinc-500 block mt-1">Assigned batches</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Assigned Mentees */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Mentees</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalMentees}</span>
            <span className="text-xs text-zinc-500 block mt-1">Interns enrolled</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Reviews Queue */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Pending Reviews</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{pendingReviewsCount}</span>
            <span className="text-xs text-zinc-500 block mt-1">Submissions waiting for grades</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Sync sync schedule and Cohorts queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next live meeting Widget */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-4">Upcoming Discussion Session</h3>
            {upcomingMeeting ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-950/40 rounded-2xl">
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">{upcomingMeeting.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{upcomingMeeting.description}</p>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-650 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>
                      {new Date(upcomingMeeting.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>
                      {new Date(upcomingMeeting.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })} ({upcomingMeeting.duration} mins)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm space-y-2">
                <Video className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p>No lectures scheduled currently.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {upcomingMeeting && (
              <a
                href={upcomingMeeting.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-sm font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Launch Meeting</span>
              </a>
            )}
            <Link
              href="/mentor/meetings"
              className="w-full py-3 text-sm font-semibold rounded-2xl text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-250/50 dark:border-zinc-750 transition-all text-center block"
            >
              Configure Discussions
            </Link>
          </div>
        </div>

        {/* Cohorts Summary Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Active Batches</h3>
              <Link 
                href="/mentor/reviews" 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>Reviews Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {mentor.batches.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-550 text-sm space-y-2">
                <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p>No active cohorts assigned currently.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="pb-3 pr-2">Cohort Code</th>
                      <th className="pb-3 px-2">Duration</th>
                      <th className="pb-3 px-2">Mentees Enrolled</th>
                      <th className="pb-3 pl-2 text-right">Tasks Published</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 text-xs">
                    {mentor.batches.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                        <td className="py-3.5 pr-2 font-bold text-zinc-900 dark:text-white">
                          {b.batchCode}
                        </td>
                        <td className="py-3.5 px-2 text-zinc-550">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-2 font-semibold text-zinc-700 dark:text-zinc-300">
                          {b.students.length} interns
                        </td>
                        <td className="py-3.5 pl-2 text-right text-zinc-650 dark:text-zinc-400">
                          {b.assignments.length} tasks
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
