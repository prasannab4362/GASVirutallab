import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { FileSpreadsheet, Calendar } from "lucide-react";

export default async function AdminReportsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">Reports Console</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Compile performance metrics, batch graduation summaries, and engagement logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm space-y-4">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-zinc-955 dark:text-white text-sm">Interns Gradebook Audit</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed mt-1">
              Generate a full spreadsheet record of intern marks, assignment revisions, and lead mentor review summaries.
            </p>
          </div>
          <button type="button" className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10">
            Compile Excel Report
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm space-y-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-zinc-955 dark:text-white text-sm">Attendance Check-in Sheets</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed mt-1">
              Audit weekly checking patterns, total hours logged, and lecture check-in metrics for cohort interns.
            </p>
          </div>
          <button type="button" className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10">
            Compile PDF Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
