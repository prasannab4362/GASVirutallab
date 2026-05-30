"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  Clock, 
  Trash2, 
  Plus, 
  ArrowLeftRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  createProjectTaskAction, 
  updateProjectTaskStatusAction, 
  deleteProjectTaskAction,
  updateProjectProgressAction
} from "@/lib/actions/project-actions";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  progressPercentage: number;
  status: string;
  tasks: Task[];
}

interface ProjectDetailsBoardProps {
  project: Project;
  isMentorView?: boolean;
}

export default function ProjectDetailsBoard({ project, isMentorView = false }: ProjectDetailsBoardProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  
  // Progress editing state
  const [progressVal, setProgressVal] = useState(project.progressPercentage);
  const [statusVal, setStatusVal] = useState(project.status);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const todoTasks = project.tasks.filter(t => t.status === "TODO");
  const inProgressTasks = project.tasks.filter(t => t.status === "IN_PROGRESS");
  const completedTasks = project.tasks.filter(t => t.status === "COMPLETED");

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsAddingTask(true);
    setMessage(null);

    try {
      const res = await createProjectTaskAction(project.id, taskTitle);
      if (res.success) {
        setTaskTitle("");
        setMessage({ success: true, text: "Task added!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setMessage({ success: false, text: res.error || "Failed to add task." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleShiftStatus = async (taskId: string, currentStatus: string, direction: "next" | "prev") => {
    setUpdatingTaskId(taskId);
    let nextStatus = "TODO";
    
    if (currentStatus === "TODO" && direction === "next") {
      nextStatus = "IN_PROGRESS";
    } else if (currentStatus === "IN_PROGRESS") {
      nextStatus = direction === "next" ? "COMPLETED" : "TODO";
    } else if (currentStatus === "COMPLETED" && direction === "prev") {
      nextStatus = "IN_PROGRESS";
    }

    try {
      const res = await updateProjectTaskStatusAction(taskId, nextStatus as any);
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await deleteProjectTaskAction(taskId);
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleSaveProgress = async () => {
    setIsSavingProgress(true);
    setMessage(null);

    try {
      const res = await updateProjectProgressAction(project.id, progressVal, statusVal as any);
      if (res.success) {
        setMessage({ success: true, text: "Project progress updated!" });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ success: false, text: res.error || "Failed to update project." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsSavingProgress(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          message.success 
            ? "bg-green-50 text-green-700 border border-green-150" 
            : "bg-red-50 text-red-750 border border-red-155"
        }`}>
          {message.text}
        </div>
      )}

      {/* Progress Modifier block (For Student / Mentors) */}
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 space-y-4">
        <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Update Project Metrics
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
          {/* Progress Slider */}
          <div className="sm:col-span-1 space-y-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Completion Rate: {progressVal}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={progressVal}
              onChange={(e) => setProgressVal(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-1 space-y-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Project Status
            </label>
            <select
              value={statusVal}
              onChange={(e) => setStatusVal(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-750 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all dark:text-white"
            >
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <button
            onClick={handleSaveProgress}
            disabled={isSavingProgress}
            className="w-full sm:w-auto px-4 py-2.5 font-semibold text-white bg-blue-650 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
          >
            {isSavingProgress ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span>Save Progress</span>
            )}
          </button>
        </div>
      </div>

      {/* Kanban Task Board Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
            Kanban Task Board
          </h4>
          
          {/* Add Task Quick form */}
          <form onSubmit={handleAddTask} className="flex gap-2 w-full sm:max-w-xs">
            <input
              type="text"
              required
              placeholder="Add new task..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 px-3 py-2 bg-zinc-55/40 dark:bg-zinc-800/40 border border-zinc-250 dark:border-zinc-750 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
            />
            <button
              type="submit"
              disabled={isAddingTask}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center"
            >
              {isAddingTask ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TO DO Column */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <span className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                To Do
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold">
                {todoTasks.length}
              </span>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {todoTasks.map(t => (
                <div key={t.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShiftStatus(t.id, t.status, "next")}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 transition-colors"
                      title="Move to In Progress"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-650 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <span className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                In Progress
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-105/10 text-blue-600 text-[10px] font-bold">
                {inProgressTasks.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {inProgressTasks.map(t => (
                <div key={t.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{t.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShiftStatus(t.id, t.status, "prev")}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600 transition-colors"
                      title="Move to To Do"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShiftStatus(t.id, t.status, "next")}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 transition-colors"
                      title="Move to Completed"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-655 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLETED Column */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <span className="font-extrabold text-zinc-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                Completed
              </span>
              <span className="px-2 py-0.5 rounded-full bg-green-105/10 text-green-605 text-[10px] font-bold">
                {completedTasks.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {completedTasks.map(t => (
                <div key={t.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-zinc-805 dark:text-zinc-300 line-through truncate">{t.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShiftStatus(t.id, t.status, "prev")}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 transition-colors"
                      title="Move to In Progress"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      disabled={updatingTaskId === t.id}
                      className="p-1 rounded-md text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-650 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
