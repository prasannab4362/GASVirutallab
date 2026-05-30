"use client";

import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Video, 
  Link2, 
  Layers, 
  FileText, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  VideoOff
} from "lucide-react";
import { createMeetingAction } from "@/lib/actions/meeting-actions";

interface Batch {
  id: string;
  batchCode: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  duration: number;
  joinUrl: string;
  status: string;
  batch: Batch | null;
}

interface MeetingsManagerProps {
  batches: Batch[];
  initialMeetings: Meeting[];
}

export default function MeetingsManager({ batches, initialMeetings }: MeetingsManagerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id || "");
  const [dateInput, setDateInput] = useState("");
  const [duration, setDuration] = useState("45");
  const [joinUrl, setJoinUrl] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !batchId || !dateInput || !duration || !joinUrl.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await createMeetingAction(
        title,
        description,
        batchId,
        dateInput,
        Number(duration),
        joinUrl,
        notes
      );

      if (res.success) {
        setMessage({ success: true, text: "Discussion scheduled successfully!" });
        
        // Refresh local items
        const selectedBatch = batches.find(b => b.id === batchId) || null;
        const newMeeting: Meeting = {
          id: Math.random().toString(),
          title,
          description,
          date: new Date(dateInput),
          duration: Number(duration),
          joinUrl,
          status: "SCHEDULED",
          batch: selectedBatch
        };

        setMeetings([newMeeting, ...meetings]);
        
        // Reset form
        setTitle("");
        setDescription("");
        setJoinUrl("");
        setNotes("");
        setDateInput("");
        setTimeout(() => {
          setShowAddForm(false);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ success: false, text: res.error || "Failed to schedule discussion." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Create Trigger Header */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <span className="text-sm font-semibold text-zinc-650 dark:text-zinc-300">
          {meetings.length} Scheduled Syncs
        </span>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setMessage(null);
          }}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Scheduler" : "Schedule Meeting"}</span>
        </button>
      </div>

      {/* Scheduler Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">
            Schedule Cohort sync
          </h3>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              message.success 
                ? "bg-green-50 text-green-700 border border-green-150" 
                : "bg-red-50 text-red-700 border border-red-155"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Convolutional Architectures Q&A"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Cohort Batch
                </label>
                <select
                  required
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchCode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Date and Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={10}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Zoom / Teams URL
                </label>
                <input
                  type="url"
                  required
                  value={joinUrl}
                  onChange={(e) => setJoinUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Session Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objectives, reading material references..."
                rows={2}
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
                  <span>Publishing Meeting...</span>
                </>
              ) : (
                <span>Schedule & Send Notifications</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm text-zinc-400 space-y-2">
            <VideoOff className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <p>No cohort discussion logs scheduled currently.</p>
          </div>
        ) : (
          meetings.map((m) => (
            <div 
              key={m.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] uppercase font-bold text-blue-650 tracking-wider bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full">
                    {m.batch?.batchCode || "General"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {m.status}
                  </span>
                </div>

                <h4 className="font-bold text-zinc-950 dark:text-white text-sm line-clamp-1 leading-snug">
                  {m.title}
                </h4>

                <p className="text-zinc-550 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                  {m.description || "No session description provided."}
                </p>

                <div className="space-y-2 text-xs text-zinc-650 dark:text-zinc-450 font-medium border-t border-zinc-50 dark:border-zinc-850 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>{new Date(m.date).toLocaleDateString()} at {new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{m.duration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                <a
                  href={m.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 text-xs font-semibold rounded-xl text-blue-650 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-blue-200 dark:border-blue-900 transition-all flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Discussion Sync</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
