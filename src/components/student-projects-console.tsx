"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Loader2,
  X,
  Layers,
  AlertCircle
} from "lucide-react";
import ProjectDetailsBoard from "./project-details-board";
import { createProjectAction } from "@/lib/actions/project-actions";

interface Mentor {
  id: string;
  user: {
    name: string;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  driveLink: string | null;
  progressPercentage: number;
  status: string;
  deadline: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  mentor: {
    id: string;
    user: {
      name: string;
    };
  };
  tasks: Task[];
}

interface StudentProjectsConsoleProps {
  initialProjects: Project[];
  mentors: Mentor[];
}

export default function StudentProjectsConsole({ initialProjects, mentors }: StudentProjectsConsoleProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProjects[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [mentorId, setMentorId] = useState(mentors[0]?.id || "");
  const [driveLink, setDriveLink] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadlineInput || !mentorId) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await createProjectAction(
        title, 
        description, 
        deadlineInput, 
        mentorId, 
        undefined, 
        driveLink.trim() || undefined
      );
      if (res.success) {
        setMessage({ success: true, text: "Project created successfully!" });
        
        // Reload page to get fully hydrated schema from database with relation configs
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to create project." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-705 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100";
      case "REVIEW":
        return "bg-amber-50 text-amber-705 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100";
      case "APPROVED":
      case "COMPLETED":
        return "bg-green-50 text-green-705 dark:bg-green-950/20 dark:text-green-400 border border-green-100";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  // Safe reference to active selection
  const activeProject = selectedProject
    ? projects.find(p => p.id === selectedProject.id) || selectedProject
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Side list column */}
      <div className="lg:col-span-1 space-y-4">
        {/* Actions header */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search projects..."
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
            <span>Create Self Project</span>
          </button>
        </div>

        {/* Pipeline List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              No project logs mapped currently.
            </div>
          ) : (
            filteredProjects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    setSelectedProject(proj);
                    setMessage(null);
                  }}
                  className={`w-full p-5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusStyle(proj.status)}`}>
                      {proj.status.replace("_", " ")}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${isSelected ? "translate-x-0.5 text-blue-600" : ""}`} />
                  </div>

                  <h4 className="font-bold text-zinc-900 dark:text-white mt-3 text-sm line-clamp-1">
                    {proj.title}
                  </h4>

                  {/* Simple Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[9px] text-zinc-450 font-medium">
                      <span>Tasks: {proj.tasks.length} items</span>
                      <span>{proj.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Board display column */}
      <div className="lg:col-span-2">
        {activeProject ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header title */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-850">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white">{activeProject.title}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-550 dark:text-zinc-450 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Mentor: {activeProject.mentor.user.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Deadline: {new Date(activeProject.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`self-start text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${getStatusStyle(activeProject.status)}`}>
                {activeProject.status.replace("_", " ")}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:bg-zinc-800/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/40">
              {activeProject.description}
            </p>

            {/* Interactive Kanban Board & Progress Sliders */}
            <ProjectDetailsBoard project={activeProject} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-400 space-y-2">
            <Briefcase className="w-10 h-10 text-zinc-300" />
            <p>Select a project log to open details.</p>
          </div>
        )}
      </div>

      {/* Creation Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" 
            onClick={() => setShowAddModal(false)} 
          />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Add Self Project Log
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 transition-colors"
              >
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

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LLM Chatbot Evaluation"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Assign Mentor
                </label>
                <select
                  required
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Target Deadline
                </label>
                <input
                  type="date"
                  required
                  value={deadlineInput}
                  onChange={(e) => setDeadlineInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Google Drive / Workspace Link (Optional)
                </label>
                <input
                  type="text"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="e.g. https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Description / Milestones
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Define objectives, dataset links, neural architecture outlines..."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-xs font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Publish Project Pipeline</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
