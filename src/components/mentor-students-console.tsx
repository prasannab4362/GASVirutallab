"use client";

import { useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Bookmark, 
  ShieldCheck, 
  Briefcase, 
  X, 
  Calendar,
  CheckCircle2,
  Award,
  Clock
} from "lucide-react";
import ProjectDetailsBoard from "./project-details-board";

interface User {
  name: string;
  email: string;
}

interface Batch {
  batchCode: string;
}

interface Program {
  title: string;
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
  progressPercentage: number;
  status: string;
  deadline: string | Date;
  tasks: Task[];
  mentor: {
    id: string;
    user: {
      name: string;
    };
  };
}

interface Student {
  id: string;
  matricNumber: string | null;
  user: User;
  batch: Batch | null;
  program: Program | null;
  submissions: any[];
  projects: Project[];
}

interface MentorStudentsConsoleProps {
  students: Student[];
}

export default function MentorStudentsConsole({ students }: MentorStudentsConsoleProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(s => 
    s.user.name.toLowerCase().includes(search.toLowerCase()) ||
    s.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.matricNumber && s.matricNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search mentees registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-55/40 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
          />
        </div>
        <span className="text-xs font-semibold text-zinc-400">
          {filteredStudents.length} mentees enrolled
        </span>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <button
            key={student.id}
            type="button"
            onClick={() => {
              setSelectedStudent(student);
              setSelectedProject(student.projects[0] || null);
            }}
            className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 shadow-sm hover:shadow-md transition-shadow text-left space-y-4"
          >
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-750 font-bold text-sm">
                {student.user.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-zinc-950 dark:text-white text-sm leading-tight">
                  {student.user.name}
                </h4>
                <span className="text-[10px] text-zinc-550 font-mono">
                  Matric: {student.matricNumber || "N/A"}
                </span>
              </div>
            </div>

            {/* Profile items */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate">{student.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Batch: <span className="font-bold text-zinc-900 dark:text-white">{student.batch?.batchCode || "N/A"}</span></span>
              </div>
            </div>

            {/* Submissions Stats */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>Project Pipeline</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">
                {student.projects.length} Active
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Student Details Slide Drawer/Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" 
            onClick={() => {
              setSelectedStudent(null);
              setSelectedProject(null);
            }} 
          />

          {/* Drawer container */}
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 z-50 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between animate-slide-right">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-105/10 flex items-center justify-center text-blue-650 font-bold text-base">
                    {selectedStudent.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-zinc-950 dark:text-white text-base">
                      {selectedStudent.user.name}
                    </h3>
                    <p className="text-xs text-zinc-450 dark:text-zinc-400">{selectedStudent.user.email} • Matric: {selectedStudent.matricNumber || "N/A"}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedStudent(null);
                    setSelectedProject(null);
                  }}
                  className="p-1.5 rounded-lg text-zinc-450 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Cohort Info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Cohort Batch</span>
                  <span className="text-zinc-900 dark:text-white font-mono">{selectedStudent.batch?.batchCode || "N/A"}</span>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Education Track</span>
                  <span className="truncate block text-zinc-905 dark:text-zinc-200">{selectedStudent.program?.title || "N/A"}</span>
                </div>
              </div>

              {/* Projects Pipeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Project pipeline logs
                </h4>

                {selectedStudent.projects.length === 0 ? (
                  <div className="p-6 bg-zinc-55/20 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl text-center text-xs text-zinc-400 italic">
                    No active projects assigned to this student.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tabs / selectors for projects */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedStudent.projects.map((p) => {
                        const isSelected = selectedProject?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProject(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                              isSelected 
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            }`}
                          >
                            {p.title}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Project Details Board */}
                    {selectedProject && (
                      <div className="p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 space-y-5">
                        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850 text-xs">
                          <div>
                            <h5 className="font-bold text-zinc-900 dark:text-white">{selectedProject.title}</h5>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                            {selectedProject.status}
                          </span>
                        </div>
                        <ProjectDetailsBoard project={selectedProject} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
