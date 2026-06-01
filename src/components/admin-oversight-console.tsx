"use client";

import { useState } from "react";
import { Users, FileCheck, DownloadCloud, Activity, Layout } from "lucide-react";
import BatchChatInterface from "./batch-chat-interface";

interface AdminOversightConsoleProps {
  batches: any[];
  currentUserId: string;
}

export default function AdminOversightConsole({ batches, currentUserId }: AdminOversightConsoleProps) {
  const [selectedBatch, setSelectedBatch] = useState<any>(batches[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      
      {/* Sidebar: Batch Selection */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider pl-1">Active Workspaces</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {batches.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              No batches found.
            </div>
          ) : (
            batches.map((batch) => {
              const isSelected = selectedBatch?.id === batch.id;
              return (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {batch.batchCode}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white mt-2 text-xs line-clamp-1">
                    {batch.program.title}
                  </h4>
                  <div className="mt-3 flex justify-between text-[9px] text-zinc-450 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {batch.students.length} Interns</span>
                    <span>Mentor: {batch.mentor?.user?.name || "Unassigned"}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {selectedBatch ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Interns</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-white">{selectedBatch.students.length}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Materials Uploaded</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-white">{selectedBatch.studyMaterials.length}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assignments</p>
                  <p className="text-xl font-black text-zinc-900 dark:text-white">{selectedBatch.assignments.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batch Chat Monitoring */}
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider mb-4 pl-1">Live Chat Monitoring</h3>
                <BatchChatInterface batchId={selectedBatch.id} currentUserId={currentUserId} />
              </div>

              {/* Resources List */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Workspace Resources</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Materials & Assignments Overview</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Materials */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Study Materials ({selectedBatch.studyMaterials.length})</h4>
                    {selectedBatch.studyMaterials.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No materials uploaded.</p>
                    ) : (
                      selectedBatch.studyMaterials.map((mat: any) => (
                        <div key={mat.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 text-xs">
                          <p className="font-bold text-zinc-900 dark:text-white">{mat.title}</p>
                          <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-[10px] mt-1 block">View Link ↗</a>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Assignments */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assignments ({selectedBatch.assignments.length})</h4>
                    {selectedBatch.assignments.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No assignments created.</p>
                    ) : (
                      selectedBatch.assignments.map((assign: any) => (
                        <div key={assign.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/30 text-xs">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-zinc-900 dark:text-white">{assign.title}</p>
                            <span className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">{assign.submissions.length} Subs</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 block">Deadline: {new Date(assign.deadline).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
            <Activity className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Select a Workspace</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
              Choose an active batch from the sidebar to monitor its chat, resources, and progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
