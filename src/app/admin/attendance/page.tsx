import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Activity } from "lucide-react";

export default async function AdminAttendancePage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const logs = await prisma.attendance.findMany({
    include: {
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: { date: "desc" },
    take: 30
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-955 dark:text-white">Attendance Registry</h1>
        <p className="text-xs sm:text-sm text-zinc-555 dark:text-zinc-400 mt-1">
          Review recent intern engagement indices, check-in timestamps, and activity logs across all cohort batches.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3 animate-pulse" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Engagement Audits</h3>
          <p className="text-zinc-550 text-xs sm:text-sm mt-1 max-w-sm">
            Engagement audits have not started yet. Logs are generated during cohort lecture check-ins.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                  <th className="py-4 px-6">Evaluation Date</th>
                  <th className="py-4 px-4">Intern</th>
                  <th className="py-4 px-4">Daily Engagement</th>
                  <th className="py-4 px-6 text-right">Status</th>
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
                      <span className="block font-bold text-zinc-900 dark:text-white">{log.student.user.name}</span>
                      <span className="text-[10px] text-zinc-450 block">{log.student.user.email}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                      {log.score}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === "PRESENT" 
                          ? "bg-green-50 text-green-700 border border-green-150" 
                          : log.status === "PARTIAL"
                            ? "bg-amber-50 text-amber-700 border border-amber-150"
                            : "bg-red-50 text-red-700 border border-red-150"
                      }`}>
                        {log.status}
                      </span>
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
