import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Settings, ToggleLeft } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">System Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-1">
          Configure security flags, certificate credentials verification properties, and platform states.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="font-extrabold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">General Configurations</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-350">
            <div className="space-y-1">
              <span className="block font-bold text-zinc-900 dark:text-white">Public Certificate Lookup</span>
              <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed">Let employers check graduation status from the landing page.</span>
            </div>
            <ToggleLeft className="w-8 h-8 text-zinc-400 cursor-pointer" />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl text-xs font-semibold text-zinc-700 dark:text-zinc-355">
            <div className="space-y-1">
              <span className="block font-bold text-zinc-900 dark:text-white">Secure Edge Cryptography</span>
              <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed">Encrypt user sessions using SHA-256 AES-GCM Web Crypto.</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
