import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { Calendar, Clock, Video, FileText, User, HelpCircle, ArrowUpRight } from "lucide-react";

export default async function StudentMeetingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "STUDENT" || !session.studentId) {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      batch: {
        include: {
          meetings: {
            include: {
              mentor: {
                include: {
                  user: true
                }
              }
            },
            orderBy: { date: "desc" }
          }
        }
      }
    }
  });

  if (!student) {
    redirect("/login");
  }

  const meetings = student.batch?.meetings || [];
  
  // Categorize meetings
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date(now.getTime() - 60 * 60 * 1000));
  const pastMeetings = meetings.filter(m => new Date(m.date) < new Date(now.getTime() - 60 * 60 * 1000));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Live Sync Syncs</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Access joining credentials for upcoming weekly cohort reviews and inspect notes from previous sync sessions.
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Scheduled Syncs</h3>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
            Your mentor has not scheduled any active live sessions for your cohort yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Syncs</h3>
            {upcomingMeetings.length === 0 ? (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                No upcoming syncs scheduled currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingMeetings.map((m) => (
                  <div 
                    key={m.id}
                    className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-650 tracking-wider bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full">
                            Live Sync
                          </span>
                          <h4 className="text-base font-bold text-zinc-950 dark:text-white mt-2 leading-snug">
                            {m.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                        {m.description}
                      </p>

                      <div className="space-y-2 text-xs text-zinc-650 dark:text-zinc-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <span>
                            {new Date(m.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "long",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-zinc-400" />
                          <span>
                            {new Date(m.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })} ({m.duration} minutes)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-zinc-400" />
                          <span>Host Mentor: {m.mentor.user.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 mt-6 flex items-center justify-between gap-4">
                      <a
                        href={m.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 text-xs font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        <span>Launch Session</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Past Syncs</h3>
            {pastMeetings.length === 0 ? (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                No past sync logs recorded.
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                        <th className="py-3 px-6">Session Title</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Host Mentor</th>
                        <th className="py-3 px-6 text-right">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 text-xs">
                      {pastMeetings.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                          <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white max-w-[200px] truncate">
                            {m.title}
                          </td>
                          <td className="py-4 px-4 text-zinc-500">
                            {new Date(m.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-zinc-500">
                            {m.duration} mins
                          </td>
                          <td className="py-4 px-4 text-zinc-700 dark:text-zinc-350">
                            {m.mentor.user.name}
                          </td>
                          <td className="py-4 px-6 text-right max-w-[200px] truncate text-zinc-500 italic">
                            {m.notes || "No recording notes published."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
