"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Mail, 
  Loader2, 
  Edit2,
  Trash2,
  AlertOctagon,
  X
} from "lucide-react";
import { 
  enrollMentorAction,
  updateMentorAction,
  deleteMentorAction
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

interface Mentor {
  id: string;
  user: User;
  batches: Batch[];
}

interface MentorsManagerProps {
  mentors: Mentor[];
  batches: Batch[];
}

export default function MentorsManager({ mentors: initialMentors, batches }: MentorsManagerProps) {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMentorForEdit, setSelectedMentorForEdit] = useState<Mentor | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editBatchIds, setEditBatchIds] = useState<string[]>([]);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMentorForDelete, setSelectedMentorForDelete] = useState<Mentor | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  const filteredMentors = mentors.filter(m => 
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await enrollMentorAction(name, email, password, selectedBatchIds);
      if (res.success) {
        setMessage({ success: true, text: "Mentor registered successfully!" });
        
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setMessage({ success: false, text: res.error || "Failed to enroll mentor." });
      }
    } catch (err) {
      setMessage({ success: false, text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForEdit || !editName.trim() || !editEmail.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await updateMentorAction(
        selectedMentorForEdit.id,
        editName,
        editEmail,
        editStatus,
        editPassword || undefined,
        editBatchIds
      );

      if (res.success) {
        setMessage({ success: true, text: "Mentor profile updated successfully!" });
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
    if (!selectedMentorForDelete) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await deleteMentorAction(selectedMentorForDelete.id);
      if (res.success) {
        setMessage({ success: true, text: "Mentor deleted successfully!" });
        setMentors(mentors.filter(m => m.id !== selectedMentorForDelete.id));
        setTimeout(() => {
          setShowDeleteModal(false);
          setSelectedMentorForDelete(null);
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

  return (
    <div className="space-y-6">
      
      {/* Search and triggers */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search mentors registry..."
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
          <span>{showAddForm ? "Close Form" : "Register Mentor"}</span>
        </button>
      </div>

      {/* Enroll Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 p-6 sm:p-8 shadow-md space-y-6 animate-scale-in">
          <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider">
            Register Lead Mentor
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
                  className="w-full px-4 py-3 bg-zinc-55/40 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Console Password
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

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Assign Cohort Batches
              </label>
              {batches.length === 0 ? (
                <p className="text-xs text-zinc-450 italic">No cohort batches active currently. Create a batch first.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {batches.map((b) => {
                    const isSelected = selectedBatchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBatchIds(selectedBatchIds.filter((id) => id !== b.id));
                          } else {
                            setSelectedBatchIds([...selectedBatchIds, b.id]);
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-600 shadow-sm"
                            : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-805 text-zinc-650 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        {b.batchCode}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-xs font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Mentor & Create credentials</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Mentor List Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Assigned Cohorts</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-55 dark:divide-zinc-850 text-xs">
              {filteredMentors.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                  <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                    {m.user.name}
                  </td>
                  <td className="py-4 px-4 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      {m.user.email}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.user.status === "ACTIVE" 
                        ? "bg-green-50 text-green-700 border border-green-150" 
                        : "bg-red-50 text-red-700 border border-red-150"
                    }`}>
                      {m.user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-blue-650 dark:text-blue-400">
                    {m.batches.length > 0 
                      ? m.batches.map(b => b.batchCode).join(", ") 
                      : "Unassigned"}
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMentorForEdit(m);
                        setEditName(m.user.name);
                        setEditEmail(m.user.email);
                        setEditStatus(m.user.status);
                        setEditBatchIds(m.batches.map(b => b.id) || []);
                        setShowEditModal(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-blue-650 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex"
                      title="Edit Mentor Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMentorForDelete(m);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all inline-flex"
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

      {/* Edit Mentor Modal */}
      {showEditModal && selectedMentorForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setShowEditModal(false); setSelectedMentorForEdit(null); }} />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                Modify Mentor Profile
              </h3>
              <button onClick={() => { setShowEditModal(false); setSelectedMentorForEdit(null); }} className="p-1 rounded-lg text-zinc-450 hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                message.success ? "bg-green-50 text-green-750 border border-green-150" : "bg-red-50 text-red-755 border border-red-155"
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Assign Cohort Batches
                </label>
                {batches.length === 0 ? (
                  <p className="text-xs text-zinc-455 italic">No cohort batches active currently.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {batches.map((b) => {
                      const isSelected = editBatchIds.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditBatchIds(editBatchIds.filter((id) => id !== b.id));
                            } else {
                              setEditBatchIds([...editBatchIds, b.id]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all text-center ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-600 shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          {b.batchCode}
                        </button>
                      );
                    })}
                  </div>
                )}
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
                  <span>Update Mentor Profile</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMentorForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setSelectedMentorForDelete(null); }} />
          
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 animate-scale-in space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto text-red-650">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-950 dark:text-white text-base">
                Delete Mentor Account
              </h3>
              <p className="text-xs text-zinc-505 dark:text-zinc-450 leading-relaxed">
                Are you sure you want to permanently delete the profile of <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedMentorForDelete.user.name}</span>? This action deletes all records and cannot be undone.
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
                onClick={() => { setShowDeleteModal(false); setSelectedMentorForDelete(null); }}
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

    </div>
  );
}
