"use client";

import { useState } from "react";
import { 
  Layers, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Bookmark,
  PlusCircle
} from "lucide-react";
import { createProgramAction, createBatchAction } from "@/lib/actions/admin-actions";

interface Mentor {
  id: string;
  user: {
    name: string;
  };
}

interface Batch {
  id: string;
  batchCode: string;
  startDate: string | Date;
  endDate: string | Date;
  mentor: Mentor | null;
}

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  startDate: string | Date;
  endDate: string | Date;
  batches: Batch[];
}

interface ProgramsManagerProps {
  programs: Program[];
  mentors: Mentor[];
}

export default function ProgramsManager({ programs: initialPrograms, mentors }: ProgramsManagerProps) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  // Program Form State
  const [programTitle, setProgramTitle] = useState("");
  const [programDesc, setProgramDesc] = useState("");
  const [programDuration, setProgramDuration] = useState("6 Months");
  const [programStart, setProgramStart] = useState("");
  const [programEnd, setProgramEnd] = useState("");

  // Batch Form State
  const [batchCode, setBatchCode] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(initialPrograms[0]?.id || "");
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0]?.id || "");
  const [batchStart, setBatchStart] = useState("");
  const [batchEnd, setBatchEnd] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const filteredPrograms = programs.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim() || !programDesc.trim() || !programDuration.trim() || !programStart || !programEnd) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await createProgramAction(
        programTitle,
        programDesc,
        programDuration,
        programStart,
        programEnd
      );

      if (res.success) {
        setMessage({ success: true, text: "Program created successfully!" });
        
        // Add to state
        const newProgram: Program = {
          id: Math.random().toString(),
          title: programTitle,
          description: programDesc,
          duration: programDuration,
          startDate: new Date(programStart),
          endDate: new Date(programEnd),
          batches: []
        };

        setPrograms([newProgram, ...programs]);

        // Reset
        setProgramTitle("");
        setProgramDesc("");
        setProgramStart("");
        setProgramEnd("");
        setTimeout(() => {
          setShowProgramForm(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ success: false, text: res.error || "Failed to create program." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !selectedProgramId || !batchStart || !batchEnd) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await createBatchAction(
        batchCode,
        selectedProgramId,
        selectedMentorId || null,
        batchStart,
        batchEnd
      );

      if (res.success) {
        setMessage({ success: true, text: `Batch ${batchCode} scheduled successfully!` });
        
        // Update local state
        const mentorObj = mentors.find(m => m.id === selectedMentorId) || null;
        const newBatch: Batch = {
          id: Math.random().toString(),
          batchCode,
          startDate: new Date(batchStart),
          endDate: new Date(batchEnd),
          mentor: mentorObj
        };

        const updatedPrograms = programs.map(p => {
          if (p.id === selectedProgramId) {
            return {
              ...p,
              batches: [newBatch, ...p.batches]
            };
          }
          return p;
        });

        setPrograms(updatedPrograms);

        // Reset
        setBatchCode("");
        setBatchStart("");
        setBatchEnd("");
        setTimeout(() => {
          setShowBatchForm(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ success: false, text: res.error || "Failed to create batch." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search programs registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-55/40 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowProgramForm(!showProgramForm);
              setShowBatchForm(false);
              setMessage(null);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Track</span>
          </button>

          <button
            onClick={() => {
              setShowBatchForm(!showBatchForm);
              setShowProgramForm(false);
              setMessage(null);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-250/50 dark:border-zinc-750 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Batch</span>
          </button>
        </div>
      </div>

      {/* Program Create Form */}
      {showProgramForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">
            Create Learning Program Track
          </h3>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              message.success ? "bg-green-50 text-green-700 border border-green-150" : "bg-red-50 text-red-700 border border-red-155"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleProgramSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Program Title
                </label>
                <input
                  type="text"
                  required
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  placeholder="e.g. Advanced Deep Learning Fellowship"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Duration Display
                </label>
                <input
                  type="text"
                  required
                  value={programDuration}
                  onChange={(e) => setProgramDuration(e.target.value)}
                  placeholder="e.g. 6 Months"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={programStart}
                  onChange={(e) => setProgramStart(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={programEnd}
                  onChange={(e) => setProgramEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Program Objectives Summary
              </label>
              <textarea
                required
                value={programDesc}
                onChange={(e) => setProgramDesc(e.target.value)}
                placeholder="Curriculum breakdown, milestone targets..."
                rows={3}
                className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-xs font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Track...</span>
                </>
              ) : (
                <span>Publish Program Track</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Batch Create Form */}
      {showBatchForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">
            Schedule Cohort Batch
          </h3>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              message.success ? "bg-green-50 text-green-700 border border-green-150" : "bg-red-50 text-red-700 border border-red-155"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Cohort Batch Code
                </label>
                <input
                  type="text"
                  required
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="e.g. AI-2026-B2"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Link to Program
                </label>
                <select
                  required
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Assign Lead Mentor
                </label>
                <select
                  required
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Cohort Start Date
                </label>
                <input
                  type="date"
                  required
                  value={batchStart}
                  onChange={(e) => setBatchStart(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Cohort End Date
                </label>
                <input
                  type="date"
                  required
                  value={batchEnd}
                  onChange={(e) => setBatchEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-xs font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling Batch...</span>
                </>
              ) : (
                <span>Schedule Cohort Batch</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Program and Cohort Grid Listing */}
      <div className="space-y-6">
        {filteredPrograms.map((p) => (
          <div 
            key={p.id}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="space-y-1">
                <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">
                  {p.title}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-450 text-xs">
                  {p.description}
                </p>
              </div>

              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-650" />
                  {p.duration}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] bg-zinc-50 dark:bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-650" />
                  {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Batches Sub-section */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
                Scheduled Cohort Batches
              </span>

              {p.batches.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No cohort batches active under this program track.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {p.batches.map(b => (
                    <div 
                      key={b.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-zinc-900 dark:text-white font-mono flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                          {b.batchCode}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {b.mentor && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium pt-1 border-t border-zinc-100 dark:border-zinc-800/50">
                          <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Mentor: {b.mentor.user.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
