"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  ExternalLink, 
  User, 
  Calendar, 
  FileText, 
  Award, 
  MessageSquare, 
  Loader2, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { gradeSubmissionAction } from "@/lib/actions/submission-actions";

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
  assignment: {
    title: string;
    description: string;
  };
  student: {
    user: {
      name: string;
      email: string;
    };
  };
}

interface ReviewsListProps {
  initialSubmissions: Submission[];
}

export default function ReviewsList({ initialSubmissions }: ReviewsListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    initialSubmissions.filter(s => s.status === "SUBMITTED")[0] || initialSubmissions[0] || null
  );
  
  const [filter, setFilter] = useState<"ALL" | "SUBMITTED" | "GRADED">("SUBMITTED");
  const [search, setSearch] = useState("");
  
  // Grading form state
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Filter and search logic
  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filter === "ALL" || s.status === filter;
    const matchesSearch = s.student.user.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.assignment.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !marks.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await gradeSubmissionAction(selectedSubmission.id, Number(marks), feedback);
      if (res.success) {
        setMessage({ success: true, text: "Submission graded successfully!" });
        
        // Update local state
        const updatedSubmissions = submissions.map(s => {
          if (s.id === selectedSubmission.id) {
            return {
              ...s,
              status: "GRADED",
              marks: Number(marks),
              feedback: feedback,
              updatedAt: new Date()
            };
          }
          return s;
        });

        setSubmissions(updatedSubmissions);
        // Update currently selected item copy
        const currentUpdated = updatedSubmissions.find(s => s.id === selectedSubmission.id) || null;
        setSelectedSubmission(currentUpdated);
        
        setMarks("");
        setFeedback("");
      } else {
        setMessage({ success: false, text: res.error || "Failed to save grades." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "GRADED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold border border-green-150">
          Graded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-150 animate-pulse">
        Review Pending
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Sidebar Queue */}
      <div className="lg:col-span-1 space-y-4">
        {/* Filters */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by intern/task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
            />
          </div>

          {/* Tab filter buttons */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            {(["SUBMITTED", "GRADED", "ALL"] as const).map((opt) => {
              const active = filter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    active
                      ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
                  }`}
                >
                  {opt === "SUBMITTED" ? "Pending" : opt === "GRADED" ? "Graded" : "All"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              No submissions found matching criteria.
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubmission(sub);
                    setMessage(null);
                    setMarks(sub.marks !== null ? String(sub.marks) : "");
                    setFeedback(sub.feedback || "");
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[120px]">
                      {sub.student.user.name}
                    </span>
                    {getStatusBadge(sub.status)}
                  </div>
                  <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-2 truncate">
                    {sub.assignment.title}
                  </h4>
                  <span className="text-[9px] text-zinc-400 block mt-1 font-mono">
                    v{sub.version} • {new Date(sub.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Details/Grading Form */}
      <div className="lg:col-span-2">
        {selectedSubmission ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-zinc-150 dark:border-zinc-850">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                  Evaluate Submission
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-1 text-xs text-zinc-550 dark:text-zinc-450 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Intern: {selectedSubmission.student.user.name} ({selectedSubmission.student.user.email})
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Submitted: {new Date(selectedSubmission.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="self-start">{getStatusBadge(selectedSubmission.status)}</div>
            </div>

            {/* Assignment Info */}
            <div className="p-4 bg-zinc-55/30 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider text-[10px]">
                Assignment Task
              </span>
              <span className="font-semibold text-zinc-900 dark:text-white block text-sm">{selectedSubmission.assignment.title}</span>
              <p className="text-zinc-500 dark:text-zinc-455 mt-1 leading-relaxed">{selectedSubmission.assignment.description}</p>
            </div>

            {/* Student Deliverable Link */}
            <div className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/20 rounded-xl flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{selectedSubmission.fileName}</span>
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">(v{selectedSubmission.version})</span>
              </div>
              
              <a
                href={selectedSubmission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-blue-650 hover:text-blue-700 transition-colors shrink-0"
              >
                <span>Open Project Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* If already graded details */}
            {selectedSubmission.status === "GRADED" && (
              <div className="p-5 bg-green-50/40 dark:bg-green-950/10 border border-green-100 dark:border-green-950/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-green-800 dark:text-green-400 text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-green-600" />
                  Recorded Evaluation
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                  <div>
                    <span className="text-[9px] uppercase text-zinc-400 block tracking-wider">Score</span>
                    <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-0.5 block">{selectedSubmission.marks}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase text-zinc-400 block tracking-wider">Feedback Notes</span>
                    <p className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-300 italic">{selectedSubmission.feedback || "No comments written."}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Grading Form */}
            <div className="border-t border-zinc-150 dark:border-zinc-850 pt-6 space-y-4">
              <h4 className="font-bold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
                {selectedSubmission.status === "GRADED" ? "Edit Evaluation Grades" : "Grade Submission"}
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

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Awarded Marks (0-100)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="e.g. 90"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Detailed Review Comments
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write guidance notes, corrections, or praise..."
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
                      <span>Saving Grades...</span>
                    </>
                  ) : (
                    <span>{selectedSubmission.status === "GRADED" ? "Update Marks & Feedback" : "Submit Evaluation Grade"}</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] text-zinc-400">
            Select an intern submission to evaluate.
          </div>
        )}
      </div>

    </div>
  );
}
