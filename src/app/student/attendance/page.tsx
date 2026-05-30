import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Activity, Award, CheckCircle2, AlertTriangle, XCircle, TrendingUp } from "lucide-react";

export default async function StudentAttendancePage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT" || !session.studentId) {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      attendance: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!student) {
    redirect("/login");
  }

  const logs = student.attendance || [];
  
  // Calculate attendance averages
  const totalLogs = logs.length;
  const averageScore = totalLogs > 0
    ? Math.round(logs.reduce((sum, item) => sum + item.score, 0) / totalLogs)
    : 0;

  const presentCount = logs.filter(l => l.status === "PRESENT").length;
  const partialCount = logs.filter(l => l.status === "PARTIAL").length;
  const absentCount = logs.filter(l => l.status === "INACTIVE").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-150">
            <CheckCircle2 className="w-3 h-3" />
            Present
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-150">
            <AlertTriangle className="w-3 h-3" />
            Partial Activity
          </span>
        );
      case "INACTIVE":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-150">
            <XCircle className="w-3 h-3" />
            Absent / Inactive
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Engagement Logs</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Monitor your daily platform interactions, lecture attendance scores, and sync engagement indices.
        </p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Average Score</span>
          <span className="text-3xl font-extrabold text-zinc-950 dark:text-white block font-mono">{averageScore}%</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-green-550" />
            <span>Target threshold: 75%</span>
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Present Syncs</span>
          <span className="text-3xl font-extrabold text-zinc-950 dark:text-white block font-mono">{presentCount}</span>
          <span className="text-xs text-zinc-500">Fully engaged lectures</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Partial Syncs</span>
          <span className="text-3xl font-extrabold text-zinc-950 dark:text-white block font-mono">{partialCount}</span>
          <span className="text-xs text-zinc-500">Partial workspace activity</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Absent Syncs</span>
          <span className="text-3xl font-extrabold text-zinc-950 dark:text-white block font-mono">{absentCount}</span>
          <span className="text-xs text-zinc-500">Unexcused inactive syncs</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Engagement Logs</h3>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
            Engagement audits have not started yet. Logs are generated during cohort milestone evaluations.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                  <th className="py-3.5 px-6">Evaluation Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Daily Engagement Score</th>
                  <th className="py-3.5 px-6">Activity Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-55 dark:divide-zinc-850 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {log.score}%
                    </td>
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-450 italic">
                      {log.details || "Automated sync verification complete."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
