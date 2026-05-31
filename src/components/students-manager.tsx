"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Bookmark, 
  Award, 
  Loader2, 
  X,
  Edit2,
  Trash2,
  AlertOctagon,
  ShieldCheck
} from "lucide-react";
import { 
  enrollStudentAction, 
  generateCertificateAction,
  updateStudentAction,
  deleteStudentAction
} from "@/lib/actions/admin-actions";

interface User {
  name: string;
  email: string;
  status: string;
}

interface Batch {
  id: string;
  batchCode: string;
}

interface Program {
  id: string;
  title: string;
}

interface Project {
  status: string;
  driveLink: string | null;
}

interface Certificate {
  id: string;
}

interface Attendance {
  score: number;
}

interface Student {
  id: string;
  matricNumber: string | null;
  user: User;
  batch: Batch | null;
  program: Program | null;
  projects: Project[];
  certificates: Certificate[];
  attendance: Attendance[];
}

interface StudentsManagerProps {
  students: Student[];
  batches: Batch[];
  programs: Program[];
}

export default function StudentsManager({ students: initialStudents, batches, programs }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Cert Form State
  const [showCertForm, setShowCertForm] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [certNumber, setCertNumber] = useState("");

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editMatric, setEditMatric] = useState("");
  const [editBatchId, setEditBatchId] = useState("");
  const [editProgramId, setEditProgramId] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  // Delete Form State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudentForDelete, setSelectedStudentForDelete] = useState<Student | null>(null);

  // Student Enrollment Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id || "");
  const [programId, setProgramId] = useState(programs[0]?.id || "");

  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  
  // Filtration Tab state: ALL, ELIGIBLE, GRADUATED
  const [filterTab, setFilterTab] = useState<"ALL" | "ELIGIBLE" | "GRADUATED">("ALL");

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.matricNumber && s.matricNumber.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    const totalAtt = s.attendance?.length || 0;
    const avgAtt = totalAtt > 0 ? Math.round(s.attendance.reduce((sum, curr) => sum + curr.score, 0) / totalAtt) : 0;
    const hasProj = s.projects?.some(p => (p.status === "COMPLETED" || p.status === "APPROVED") && p.driveLink !== null && p.driveLink.trim() !== "") || false;
    const hasCert = (s.certificates?.length || 0) > 0;

    if (filterTab === "ELIGIBLE") {
      return avgAtt >= 75 && hasProj && !hasCert;
    }
    if (filterTab === "GRADUATED") {
      return hasCert;
    }
    return true;
  });

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !matricNumber.trim() || !batchId || !programId) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await enrollStudentAction(name, email, password, matricNumber, batchId, programId);
      if (res.success) {
        setMessage({ success: true, text: "Student enrolled successfully!" });
        
        // Reload to retrieve fully hydrated relationships and User status details
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to enroll student." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit || !editName.trim() || !editEmail.trim() || !editMatric.trim() || !editBatchId || !editProgramId) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await updateStudentAction(
        selectedStudentForEdit.id,
        editName,
        editEmail,
        editMatric,
        editBatchId,
        editProgramId,
        editStatus,
        editPassword || undefined
      );

      if (res.success) {
        setMessage({ success: true, text: "Student profile updated successfully!" });
        
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudentForDelete) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await deleteStudentAction(selectedStudentForDelete.id);
      if (res.success) {
        setMessage({ success: true, text: "Student deleted successfully!" });
        setStudents(students.filter(s => s.id !== selectedStudentForDelete.id));
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedStudentForDelete(null);
          setMessage(null);
        }, 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to delete account." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForCert || !certNumber.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await generateCertificateAction(
        selectedStudentForCert.id,
        selectedStudentForCert.program?.id || "",
        certNumber
      );

      if (res.success) {
        setMessage({ success: true, text: `Certificate ${certNumber} released successfully!` });
        setCertNumber("");
        setTimeout(() => {
          setShowCertForm(false);
          setSelectedStudentForCert(null);
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ success: false, text: res.error || "Failed to release certificate." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and trigger header */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search interns registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-55/40 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
          />
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setMessage(null);
          }}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Enroll Intern"}</span>
        </button>
      </div>

      {/* Enroll Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">
            Enroll New Intern
          </h3>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-semibold ${
              message.success 
                ? "bg-green-50 text-green-700 border border-green-150" 
                : "bg-red-50 text-red-750 border border-red-155"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sandra Bullock"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sandra@gas.ai"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Portal Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Matric Number
                </label>
                <input
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  placeholder="e.g. GAS-2026-S12"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Cohort Batch allocation
                </label>
                <select
                  required
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchCode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Educational Program
                </label>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
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
                  <span>Enrolling...</span>
                </>
              ) : (
                <span>Enroll Intern & Create Intern Record</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Filtration Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 text-xs">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`px-4 py-2 font-bold transition-all rounded-lg border ${
            filterTab === "ALL"
              ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-950/40 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-355 border-transparent"
          }`}
        >
          All Interns ({students.length})
        </button>
        <button
          onClick={() => setFilterTab("ELIGIBLE")}
          className={`px-4 py-2 font-bold transition-all rounded-lg border ${
            filterTab === "ELIGIBLE"
              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-950/40 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350 border-transparent"
          }`}
        >
          Eligible for Graduation ({
            students.filter(s => {
              const totalAtt = s.attendance?.length || 0;
              const avgAtt = totalAtt > 0 ? Math.round(s.attendance.reduce((sum, curr) => sum + curr.score, 0) / totalAtt) : 0;
              const hasProj = s.projects?.some(p => (p.status === "COMPLETED" || p.status === "APPROVED") && p.driveLink !== null && p.driveLink.trim() !== "") || false;
              const hasCert = (s.certificates?.length || 0) > 0;
              return avgAtt >= 75 && hasProj && !hasCert;
            }).length
          })
        </button>
        <button
          onClick={() => setFilterTab("GRADUATED")}
          className={`px-4 py-2 font-bold transition-all rounded-lg border ${
            filterTab === "GRADUATED"
              ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-950/40 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350 border-transparent"
          }`}
        >
          Graduated / Certified ({
            students.filter(s => (s.certificates?.length || 0) > 0).length
          })
        </button>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="py-4 px-6">Name / Matric</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Cohort Batch</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Graduation Readiness</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-55 dark:divide-zinc-850 text-xs">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    <span className="block">{s.user.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{s.matricNumber || "N/A"}</span>
                  </td>
                  <td className="py-4 px-4 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {s.user.email}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-zinc-700 dark:text-zinc-350">
                    {s.batch?.batchCode || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.user.status === "ACTIVE" 
                        ? "bg-green-50 text-green-700 border border-green-150" 
                        : "bg-red-50 text-red-700 border border-red-155"
                    }`}>
                      {s.user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {(() => {
                      const totalAtt = s.attendance?.length || 0;
                      const avgAtt = totalAtt > 0 ? Math.round(s.attendance.reduce((sum, curr) => sum + curr.score, 0) / totalAtt) : 0;
                      const hasProj = s.projects?.some(p => (p.status === "COMPLETED" || p.status === "APPROVED") && p.driveLink !== null && p.driveLink.trim() !== "") || false;
                      const hasCert = (s.certificates?.length || 0) > 0;

                      if (hasCert) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-150" title="Graduation certificate officially issued">
                            Graduated
                          </span>
                        );
                      }
                      if (avgAtt >= 75 && hasProj) {
                        return (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-150" title="Meets attendance (>=75%) and project complete requirements">
                            Ready to Graduate
                          </span>
                        );
                      }
                      
                      const missing = [];
                      if (avgAtt < 75) missing.push(`Attendance: ${avgAtt}% < 75%`);
                      
                      const hasCompletedButNoDrive = s.projects?.some(p => p.status === "COMPLETED" || p.status === "APPROVED") && !s.projects?.some(p => (p.status === "COMPLETED" || p.status === "APPROVED") && p.driveLink !== null && p.driveLink.trim() !== "");
                      if (!hasProj) {
                        if (hasCompletedButNoDrive) {
                          missing.push("Completed project lacks Google Drive link");
                        } else {
                          missing.push("No completed project");
                        }
                      }

                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-semibold border border-zinc-200" title={missing.join(" | ")}>
                          Incomplete ({avgAtt}%)
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedStudentForEdit(s);
                        setEditName(s.user.name);
                        setEditEmail(s.user.email);
                        setEditMatric(s.matricNumber || "");
                        setEditBatchId(s.batch?.id || "");
                        setEditProgramId(s.program?.id || "");
                        setEditStatus(s.user.status);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex"
                      title="Edit Intern Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentForCert(s);
                        setShowCertForm(true);
                        const namePart = s.user.name.split(" ")[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
                        const matricSuffix = s.matricNumber 
                          ? s.matricNumber.split("-").pop()?.toUpperCase() || "" 
                          : s.id.substring(0, 4).toUpperCase();
                        setCertNumber(`GAS-2026-${namePart}-${matricSuffix}`);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex"
                      title="Release Certificate"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentForDelete(s);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setSelectedStudentForEdit(null); }} />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-955 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Modify Intern Profile
              </h3>
              <button onClick={() => { setShowEditModal(false); setSelectedStudentForEdit(null); }} className="p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                message.success ? "bg-green-50 text-green-750 border border-green-155" : "bg-red-50 text-red-750 border border-red-155"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Matric Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editMatric}
                    onChange={(e) => setEditMatric(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Cohort Batch Allocation
                  </label>
                  <select
                    value={editBatchId}
                    onChange={(e) => setEditBatchId(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.batchCode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Program Track
                  </label>
                  <select
                    value={editProgramId}
                    onChange={(e) => setEditProgramId(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Reset Password (Leave blank if unchanged)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-xs font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Update Intern Profile</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudentForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setSelectedStudentForDelete(null); }} />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto text-red-650">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-955 dark:text-white text-base">
                Delete Intern Account
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                Are you sure you want to permanently delete the profile of <span className="font-bold text-zinc-850 dark:text-zinc-200">{selectedStudentForDelete.user.name}</span>? This action deletes all records and cannot be undone.
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                message.success ? "bg-green-50 text-green-755 border border-green-150" : "bg-red-50 text-red-755 border border-red-155"
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setSelectedStudentForDelete(null); }}
                className="w-full py-3 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isLoading}
                className="w-full py-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Delete Profile</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Release Modal Dialog */}
      {showCertForm && selectedStudentForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm" onClick={() => { setShowCertForm(false); setSelectedStudentForCert(null); }} />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Release Graduation Credentials
              </h3>
              <button onClick={() => { setShowCertForm(false); setSelectedStudentForCert(null); }} className="p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl text-xs space-y-1">
              <span className="text-zinc-555">Intern: <span className="font-bold text-zinc-900 dark:text-white">{selectedStudentForCert.user.name}</span></span>
              <span className="block text-zinc-555">Program: <span className="font-semibold text-zinc-800 dark:text-zinc-350">{selectedStudentForCert.program?.title}</span></span>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                message.success ? "bg-green-50 text-green-755 border border-green-150" : "bg-red-50 text-red-755 border border-red-155"
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleCertReleaseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Certificate ID Code
                </label>
                <input
                  type="text"
                  required
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="e.g. GAS-2026-ALEX"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-655/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-xs font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Releasing...</span>
                  </>
                ) : (
                  <span>Verify and Release Certificate</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
