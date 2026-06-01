"use client";

import { useState } from "react";
import { FileCheck, Plus, Link as LinkIcon, Calendar, Users, FileText, ChevronRight, Loader2, X, DownloadCloud } from "lucide-react";
import { createAssignmentAction } from "@/lib/actions/assignment-actions";
import { uploadStudyMaterialAction } from "@/lib/actions/resource-actions";

interface Batch {
  id: string;
  batchCode: string;
  program: { title: string };
  students: any[];
}

interface MentorResourcesConsoleProps {
  batches: Batch[];
  assignments: any[];
  materials: any[];
}

export default function MentorResourcesConsole({ batches, assignments, materials }: MentorResourcesConsoleProps) {
  const [activeTab, setActiveTab] = useState<"assignments" | "materials">("materials");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"assignment" | "material">("material");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !batchId) return;

    setIsLoading(true);
    setMessage(null);

    try {
      if (modalType === "assignment") {
        if (!description.trim() || !deadline) return;
        const res = await createAssignmentAction(title, description, deadline, batchId);
        if (res.success) {
          setMessage({ success: true, text: "Assignment published successfully!" });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage({ success: false, text: res.error || "Failed to create assignment." });
        }
      } else {
        if (!fileUrl.trim()) return;
        const res = await uploadStudyMaterialAction(title, description, fileUrl, batchId);
        if (res.success) {
          setMessage({ success: true, text: "Material uploaded successfully!" });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setMessage({ success: false, text: res.error || "Failed to upload material." });
        }
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type: "assignment" | "material") => {
    setModalType(type);
    setTitle("");
    setDescription("");
    setDeadline("");
    setFileUrl("");
    setMessage(null);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "materials" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <DownloadCloud className="w-4 h-4" /> Study Materials
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "assignments" ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <FileCheck className="w-4 h-4" /> Assignments
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => openModal("material")}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Material
          </button>
          <button
            onClick={() => openModal("assignment")}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Assignment
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm min-h-[400px]">
        {activeTab === "materials" ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Uploaded Study Materials</h3>
            {materials.length === 0 ? (
              <div className="text-center text-zinc-400 py-12">No study materials uploaded yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map(mat => (
                  <div key={mat.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {mat.batch.batchCode}
                      </span>
                      <span className="text-[10px] text-zinc-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
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
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6">Active Assignments</h3>
            {assignments.length === 0 ? (
              <div className="text-center text-zinc-400 py-12">No assignments published yet.</div>
            ) : (
              <div className="space-y-3">
                {assignments.map(assign => (
                  <div key={assign.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {assign.batch.batchCode}
                        </span>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{assign.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline: {new Date(assign.deadline).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {assign.submissions.length} Submissions</span>
                      </div>
                    </div>
                    <a href={`/mentor/reviews`} className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors">
                      Grade Subs
                    </a>
                  </div>
                ))}
              </div>
            )}
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
                {modalType === "assignment" ? <FileCheck className="w-5 h-5 text-blue-600" /> : <FileText className="w-5 h-5 text-emerald-600" />}
                {modalType === "assignment" ? "Create Assignment" : "Upload Material"}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Title</label>
                <input
                  type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder={modalType === "assignment" ? "e.g. Week 2 Neural Networks" : "e.g. Python Crash Course PDF"}
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

              {modalType === "assignment" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Deadline</label>
                  <input
                    type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  />
                </div>
              )}

              {modalType === "material" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">File Link (Drive / Dropbox)</label>
                  <input
                    type="url" required value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Description {modalType === "material" && "(Optional)"}</label>
                <textarea
                  required={modalType === "assignment"} value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <button
                type="submit" disabled={isLoading}
                className={`w-full py-3.5 text-xs font-semibold rounded-2xl text-white disabled:opacity-60 transition-all flex items-center justify-center gap-1.5 ${
                  modalType === "assignment" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></> : <span>{modalType === "assignment" ? "Publish Assignment" : "Upload Material"}</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
