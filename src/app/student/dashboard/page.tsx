import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  FileText, 
  BookOpen, 
  Percent, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import DailyStandupWidget from "@/components/daily-standup-widget";

export default async function StudentDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch full student record
  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      program: true,
      batch: {
        include: {
          assignments: {
            where: { status: "ACTIVE" }
          },
          meetings: {
            where: {
              date: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Meeting started in last hour or future
            },
            orderBy: { date: "asc" },
            take: 1,
          },
        },
      },
      projects: true,
      submissions: {
        include: {
          assignment: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      attendance: true,
    },
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-950">Student Profile Incomplete</h2>
        <p className="text-zinc-500 text-sm mt-2 max-w-sm">
          Your account is registered, but your student enrollment file is missing. Please contact platform administration.
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalAttendance = student.attendance.length;
  const avgAttendanceScore = totalAttendance > 0 
    ? Math.round(student.attendance.reduce((sum, curr) => sum + curr.score, 0) / totalAttendance)
    : 0;

  const totalAssignments = student.batch?.assignments.length || 0;
  const totalSubmissions = student.submissions.length;
  
  const completedProjects = student.projects.filter(p => p.status === "COMPLETED" || p.status === "APPROVED").length;
  const totalProjects = student.projects.length;

  const upcomingMeeting = student.batch?.meetings[0];

  // Lookup today's checkin record (at normalized 00:00:00 date)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayCheckin = student.attendance.find((a) => {
    const aDate = new Date(a.date);
    aDate.setHours(0, 0, 0, 0);
    return aDate.getTime() === todayDate.getTime();
  }) || null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg border border-zinc-800">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Fellowship Workspace</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {session.name}!
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Program: <span className="font-semibold text-zinc-200">{student.program?.title || "Enrollment Pending"}</span> 
              {student.batch && (
                <>
                  {" • "} Cohort Code: <span className="font-semibold text-zinc-200">{student.batch.batchCode}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Rate */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Attendance Rate</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{avgAttendanceScore}%</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>Calculated from {totalAttendance} syncs</span>
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Assignments Progress */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Assignments</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">
              {totalSubmissions} <span className="text-sm font-normal text-zinc-500">/ {totalAssignments} Uploaded</span>
            </span>
            <span className="text-xs text-zinc-500 block mt-1">
              {totalAssignments - totalSubmissions > 0 
                ? `${totalAssignments - totalSubmissions} pending submission` 
                : "All tasks completed"}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Project Pipeline */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Projects Pipeline</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">
              {completedProjects} <span className="text-sm font-normal text-zinc-500">/ {totalProjects} Completed</span>
            </span>
            <span className="text-xs text-zinc-500 block mt-1">
              {totalProjects - completedProjects} active project logs
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daily Check-In / Standup Updates */}
      <DailyStandupWidget initialCheckin={todayCheckin ? { details: todayCheckin.details } : null} />

      {/* Main Grid: Meeting Sync + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next live Sync Widget */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white mb-4">Upcoming Mentor Sync</h3>
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
                <p>No cohort sync scheduled currently.</p>
              </div>
            )}
          </div>

          {upcomingMeeting && (
            <a
              href={upcomingMeeting.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 text-sm font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Join Session</span>
            </a>
          )}
        </div>

        {/* Recent Activities Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Recent Activities</h3>
              <Link 
                href="/student/assignments" 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>All Assignments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {student.submissions.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 dark:text-zinc-550 text-sm space-y-2">
                <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <p>No recent assignment logs or submissions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      <th className="pb-3 pr-2">Assignment</th>
                      <th className="pb-3 px-2">Submitted</th>
                      <th className="pb-3 px-2">Grade</th>
                      <th className="pb-3 pl-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 text-xs">
                    {student.submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                        <td className="py-3 pr-2 font-medium text-zinc-900 dark:text-zinc-100 max-w-[150px] truncate">
                          {sub.assignment.title}
                        </td>
                        <td className="py-3 px-2 text-zinc-500">
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                          })}
                        </td>
                        <td className="py-3 px-2">
                          {sub.status === "GRADED" && sub.marks !== null ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-semibold font-mono">
                              {sub.marks}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <Link 
                            href="/student/assignments"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Details
                          </Link>
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
