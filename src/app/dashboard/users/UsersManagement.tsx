"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "@/actions/complaints";
import ConfirmModal from "@/components/ConfirmModal";
import Dropdown from "@/components/Dropdown";
import { formatDate } from "@/lib/utils";
import { Trash2, Loader2, Search, Shield } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UsersManagement({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, role: string) => {
    setLoading(userId);
    await updateUserRole(userId, role);
    setLoading(null);
    window.location.reload();
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setLoading(confirmDelete);
    await deleteUser(confirmDelete);
    setLoading(null);
    setConfirmDelete(null);
    window.location.reload();
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-400 border-red-500/20",
    ngo: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    authority: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    user: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Users</h1>

      <div className="glass-card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-[140px]">
                      <Dropdown
                        value={u.role}
                        onChange={(val) => handleRoleChange(u._id, val)}
                        options={[
                          { label: "User", value: "user" },
                          { label: "Admin", value: "admin" },
                          { label: "NGO", value: "ngo" },
                          { label: "Authority", value: "authority" },
                        ]}
                        className="text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setConfirmDelete(u._id)} disabled={loading === u._id}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400">
                      {loading === u._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-12 text-center text-slate-500">No users found.</div>}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        loading={!!loading && loading === confirmDelete}
      />
    </div>
  );
}
