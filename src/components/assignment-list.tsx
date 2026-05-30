"use client";

import { useState } from "react";
import { 
  FileCheck, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  UploadCloud, 
  ChevronRight,
  MessageSquare,
  Award,
  Loader2
} from "lucide-react";
import { submitAssignmentAction } from "@/lib/actions/submission-actions";

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string | Date;
  status: string;
  createdAt: string | Date;
}

interface Submission {
  id: string;
  assignmentId: string;
  fileUrl: string;
  fileName: string;
  version: number;
  status: string;
  marks: number | null;
  feedback: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AssignmentListProps {
  assignments: Assignment[];
  submissions: Submission[];
}

export default function AssignmentList({ assignments, submissions }: AssignmentListProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(assignments[0] || null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Find submission for selected assignment
  const activeSubmission = selectedAssignment
    ? submissions.find(s => s.assignmentId === selectedAssignment.id)
    : null;

  // Determine status of an assignment
  const getAssignmentStatus = (assign: Assignment) => {
    const sub = submissions.find(s => s.assignmentId === assign.id);
    if (sub) {
      return sub.status === "GRADED" ? "GRADED" : "SUBMITTED";
    }
    const isOverdue = new Date() > new Date(assign.deadline);
    return isOverdue ? "OVERDUE" : "PENDING";
  };

  const getStatusBadge = (status: string, marks?: number | null) => {
    switch (status) {
      case "GRADED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-150">
            <Award className="w-3 h-3" />
            Graded ({marks}%)
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-150">
            <CheckCircle2 className="w-3 h-3" />
            Submitted
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-150">
            <AlertCircle className="w-3 h-3 animate-pulse" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !fileName.trim() || !fileUrl.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await submitAssignmentAction(selectedAssignment.id, fileName, fileUrl);
      if (res.success) {
        setMessage({ success: true, text: "Assignment submitted successfully!" });
        setFileName("");
        setFileUrl("");
        
        // Refresh local state by mocking a reload or let user refresh page.
        // We will suggest refreshing or just let the router update, since page is revalidated.
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ success: false, text: res.error || "Failed to submit assignment." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* List Panel */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Assignments</h3>
        
        <div className="space-y-3">
          {assignments.map((assign) => {
            const isSelected = selectedAssignment?.id === assign.id;
            const status = getAssignmentStatus(assign);
            const sub = submissions.find(s => s.assignmentId === assign.id);

            return (
              <button
                key={assign.id}
                type="button"
                onClick={() => {
                  setSelectedAssignment(assign);
                  setMessage(null);
                }}
                className={`w-full p-5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-blue-600 shadow-sm"
                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {getStatusBadge(status, sub?.marks)}
                  <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isSelected ? "translate-x-0.5 text-blue-600" : ""}`} />
                </div>

                <h4 className="font-bold text-zinc-900 dark:text-white mt-3 text-sm line-clamp-1">
                  {assign.title}
                </h4>

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-2 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>
                    Due: {new Date(assign.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details/Form Panel */}
      <div className="lg:col-span-2">
        {selectedAssignment ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-zinc-150 dark:border-zinc-850">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
                  {selectedAssignment.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-zinc-550 dark:text-zinc-400 font-medium">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    Deadline: {new Date(selectedAssignment.deadline).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
              <div className="self-start">
                {getStatusBadge(
                  getAssignmentStatus(selectedAssignment), 
                  activeSubmission?.marks
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Assignment Description</h3>
              <p className="text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-line">
                {selectedAssignment.description}
              </p>
            </div>

            {/* Graded feedback */}
            {activeSubmission && activeSubmission.status === "GRADED" && (
              <div className="p-6 bg-green-50/40 dark:bg-green-950/10 border border-green-100 dark:border-green-950/20 rounded-2xl space-y-4">
                <h4 className="font-bold text-green-800 dark:text-green-400 text-sm flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Mentor Grade & Evaluation
                </h4>
                
                <div className="grid sm:grid-cols-3 gap-6 items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-green-600/70 tracking-wider block">Awarded Score</span>
                    <span className="text-3xl font-extrabold text-green-800 dark:text-green-400 font-mono tracking-tight block">
                      {activeSubmission.marks}%
                    </span>
                  </div>

                  <div className="sm:col-span-2 space-y-2.5 text-xs text-zinc-650 dark:text-zinc-400 border-l border-zinc-200/50 dark:border-zinc-800/50 pl-6">
                    <div className="flex items-start gap-1.5">
                      <MessageSquare className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-zinc-800 dark:text-zinc-200">Feedback:</span>
                        <span className="mt-0.5 block leading-relaxed italic">{activeSubmission.feedback || "No textual comments provided."}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Existing submission display */}
            {activeSubmission && (
              <div className="p-5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                    Current Submission (v{activeSubmission.version})
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    Logged: {new Date(activeSubmission.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{activeSubmission.fileName}</span>
                  </div>
                  
                  <a
                    href={activeSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-blue-650 hover:text-blue-700 transition-colors shrink-0"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Submission Form */}
            {(!activeSubmission || activeSubmission.status !== "GRADED") && (
              <div className="border-t border-zinc-150 dark:border-zinc-850 pt-6 space-y-4">
                <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  {activeSubmission ? "Submit New Revision" : "Upload Deliverables"}
                </h4>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-semibold ${
                    message.success 
                      ? "bg-green-50 text-green-700 border border-green-150" 
                      : "bg-red-50 text-red-700 border border-red-155"
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                        Notebook / Code File Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="e.g. resnet_model_submission.ipynb"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                        Deliverable URL (GitHub / Google Drive)
                      </label>
                      <input
                        type="url"
                        required
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        placeholder="https://github.com/user/project-repo"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 text-xs font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Files...</span>
                      </>
                    ) : (
                      <span>{activeSubmission ? "Submit Revision" : "Submit Assignment"}</span>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] text-zinc-400">
            Select an assignment to view details.
          </div>
        )}
      </div>

    </div>
  );
}
