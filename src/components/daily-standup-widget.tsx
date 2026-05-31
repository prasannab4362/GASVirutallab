"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  Loader2, 
  Send, 
  CalendarCheck,
  Edit3,
  FileCheck2
} from "lucide-react";
import { submitDailyCheckinAction } from "@/lib/actions/attendance-actions";

interface DailyStandupWidgetProps {
  initialCheckin: {
    details: string | null;
  } | null;
}

export default function DailyStandupWidget({ initialCheckin }: DailyStandupWidgetProps) {
  const [eodText, setEodText] = useState(initialCheckin?.details || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedIn, setCheckedIn] = useState(!!initialCheckin);
  const [isEditing, setIsEditing] = useState(!initialCheckin);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eodText.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await submitDailyCheckinAction(eodText);
      if (res.success) {
        setCheckedIn(true);
        setIsEditing(false);
        setMessage({ success: true, text: "Check-in complete! Daily EOD update forwarded to your mentor." });
      } else {
        setMessage({ success: false, text: res.error || "Failed to check in." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-850">
        <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          Daily EOD Check-In
        </h3>
        {checkedIn && !isEditing && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-150">
            <CheckCircle2 className="w-3 h-3" />
            Checked In Today
          </span>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          message.success 
            ? "bg-green-50 text-green-700 border border-green-150" 
            : "bg-red-50 text-red-750 border border-red-155"
        }`}>
          {message.text}
        </div>
      )}

      {checkedIn && !isEditing ? (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl text-xs space-y-2">
            <span className="font-bold text-zinc-400 uppercase tracking-wider block text-[9px]">Your Submitted EOD Report:</span>
            <p className="text-zinc-700 dark:text-zinc-305 whitespace-pre-line leading-relaxed">{eodText}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-blue-650 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Standup Notes</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              What did you accomplish today?
            </label>
            <textarea
              required
              rows={3}
              value={eodText}
              onChange={(e) => setEodText(e.target.value)}
              placeholder="Completed RAG search pipeline, updated task card to 'In Progress', attended batch weekly sync..."
              className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            {checkedIn && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !eodText.trim()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit EOD Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
