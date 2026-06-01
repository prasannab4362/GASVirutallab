"use client";

import { useState } from "react";
import { FileCheck, DownloadCloud, Link as LinkIcon } from "lucide-react";
import AssignmentList from "./assignment-list";

interface StudentResourcesConsoleProps {
  assignments: any[];
  submissions: any[];
  materials: any[];
}

export default function StudentResourcesConsole({ assignments, submissions, materials }: StudentResourcesConsoleProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "assignments">("materials");

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "materials" ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <DownloadCloud className="w-4 h-4" /> Study Materials
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "assignments" ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <FileCheck className="w-4 h-4" /> Assignments
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "materials" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm min-h-[400px]">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Course Materials</h3>
          {materials.length === 0 ? (
            <div className="text-center text-zinc-400 py-12">No study materials have been posted for your cohort yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(mat => (
                <div key={mat.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] text-zinc-400">Posted on {new Date(mat.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">{mat.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{mat.description || "No description provided."}</p>
                  </div>
                  <div className="pt-3 mt-auto border-t border-zinc-100 dark:border-zinc-800">
                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> Open Material
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[400px]">
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 shadow-sm">
              <FileCheck className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">No Assignments Scheduled</h3>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-sm">
                There are currently no assignments or challenge notebooks published for your cohort batch.
              </p>
            </div>
          ) : (
            <AssignmentList assignments={assignments} submissions={submissions} />
          )}
        </div>
      )}
    </div>
  );
}
