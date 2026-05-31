import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { 
  Users, 
  ShieldAlert, 
  Layers, 
  Award, 
  Activity, 
  Clock, 
  ChevronRight,
  TrendingUp
} from "lucide-react";
import AdminCharts from "@/components/admin-charts";

export default async function AdminDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch metrics
  const totalStudents = await prisma.student.count();
  const totalMentors = await prisma.mentor.count();
  const totalPrograms = await prisma.program.count();
  const totalCertificates = await prisma.certificate.count();

  // Fetch program enrollments for the chart
  const programs = await prisma.program.findMany({
    include: {
      students: true
    }
  });

  const chartData = programs.map(p => ({
    name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
    interns: p.students.length
  }));

  // Fetch recent audit logs
  const auditLogs = await prisma.auditLog.findMany({
    include: {
      user: true
    },
    orderBy: { timestamp: "desc" },
    take: 5
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Console Overview</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Monitor global enrollment indicators, audit platform executions, and analyze educational program pipelines.
        </p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Interns</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalStudents}</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Enrolled interns</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Mentors</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalMentors}</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Active guides</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Programs</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalPrograms}</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Educational tracks</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Layers className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Graduations</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block font-mono">{totalCertificates}</span>
            <span className="text-xs text-zinc-500 block mt-0.5">Verified certificates</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Analytics Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Internship Distribution</h3>
              <span className="text-[10px] text-zinc-450 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-550" />
                <span>Active enrollments</span>
              </span>
            </div>
            <AdminCharts data={chartData} />
          </div>
        </div>

        {/* Audit Logs panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-4">Platform Audits</h3>
            
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs italic">
                No logs recorded recently.
              </div>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs leading-relaxed">
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                        {log.action}
                      </p>
                      <span className="text-[9px] text-zinc-450 block mt-0.5">
                        {log.details} • {log.user?.name || "System"} • {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
