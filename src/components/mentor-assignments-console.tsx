"use client";

import { useState } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Calendar,
  Users,
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { createAssignmentAction } from "@/lib/actions/assignment-actions";

interface Batch {
  id: string;
  batchCode: string;
  program: { title: string };
  students: any[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string | Date;
  status: string;
  batch: { batchCode: string };
  submissions: any[];
}

interface MentorAssignmentsConsoleProps {
  batches: Batch[];
  assignments: Assignment[];
}

export default function MentorAssignmentsConsole({ batches, assignments }: MentorAssignmentsConsoleProps) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(assignments[0] || null);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const filteredAssignments = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.batch.batchCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline || !batchId) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await createAssignmentAction(title, description, deadline, batchId);
      if (res.success) {
        setMessage({ success: true, text: "Assignment published successfully!" });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to create assignment." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Side List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-55/40 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
            />
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              setMessage(null);
            }}
            className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              No assignments found.
            </div>
          ) : (
            filteredAssignments.map((assign) => {
              const isSelected = selectedAssignment?.id === assign.id;
              return (
                <button
                  key={assign.id}
                  type="button"
                  onClick={() => setSelectedAssignment(assign)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {assign.batch.batchCode}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isSelected ? "translate-x-0.5 text-blue-600" : ""}`} />
                  </div>

                  <h4 className="font-bold text-zinc-900 dark:text-white mt-3 text-sm line-clamp-1">
                    {assign.title}
                  </h4>

                  <div className="mt-3 flex justify-between text-[10px] text-zinc-450 font-medium">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {assign.submissions.length} Subs</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(assign.deadline).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Details */}
      <div className="lg:col-span-2">
        {selectedAssignment ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-850">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">{selectedAssignment.title}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-550 dark:text-zinc-450 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Batch: {selectedAssignment.batch.batchCode}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Deadline: {new Date(selectedAssignment.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-800/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
              {selectedAssignment.description}
            </p>

            {/* Submissions Summary */}
            <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-850">
              <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                Intern Submissions ({selectedAssignment.submissions.length})
              </h4>
              
              {selectedAssignment.submissions.length === 0 ? (
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 text-center text-xs text-zinc-400 italic">
                  No submissions have been made yet for this assignment.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedAssignment.submissions.map((sub: any) => (
                    <div key={sub.id} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-900 dark:text-white block">{sub.student.user.name}</span>
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Deliverable ↗
                        </a>
                      </div>
                      <span className={`px-2 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        sub.status === "GRADED" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-zinc-500 text-center pt-2 italic">To grade assignments, go to the "Reviews" tab.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-400 space-y-2">
            <FileCheck className="w-10 h-10 text-zinc-300" />
            <p>Select an assignment to view details.</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Create Batch Assignment
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                message.success ? "bg-green-50 text-green-705 border border-green-150" : "bg-red-50 text-red-705 border border-red-155"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Assignment Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 2 Neural Networks Task"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Target Batch</label>
                <select
                  required value={batchId} onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchCode} ({b.program.title})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Deadline</label>
                <input
                  type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Description</label>
                <textarea
                  required value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 text-xs font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Publishing...</span></> : <span>Publish Assignment</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
