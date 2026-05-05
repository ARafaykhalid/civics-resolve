"use client";

import { useState } from "react";
import { updateUserRole, updateUserRoleWithDetails, deleteUser } from "@/actions/complaints";
import ConfirmModal from "@/components/ConfirmModal";
import Dropdown from "@/components/Dropdown";
import { formatDate, cn } from "@/lib/utils";
import {
  Trash2,
  Loader2,
  Search,
  Shield,
  Building2,
  Phone,
  MapPin,
  X,
  Tag,
} from "lucide-react";

const allCategories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UsersManagement({ users }: { users: any[] }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Role promotion modal state
  const [roleModal, setRoleModal] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    currentRole: string;
    newRole: string;
  } | null>(null);
  const [roleForm, setRoleForm] = useState({
    organization: "",
    contactPhone: "",
    address: "",
    categories: [] as string[],
  });
  const [roleError, setRoleError] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRoleChange = async (userId: string, role: string, user: any) => {
    // If promoting to authority or ngo, show the details modal
    if (["authority", "ngo"].includes(role)) {
      setRoleModal({
        userId,
        userName: user.name,
        userEmail: user.email,
        currentRole: user.role,
        newRole: role,
      });
      setRoleForm({
        organization: user.organization || "",
        contactPhone: "",
        address: "",
        categories: user.categories || [],
      });
      setRoleError("");
      return;
    }

    // For user/admin roles, just do a simple role change
    setLoading(userId);
    await updateUserRole(userId, role);
    setLoading(null);
    window.location.reload();
  };

  const handleRoleSubmit = async () => {
    if (!roleModal) return;
    if (!roleForm.organization.trim()) {
      setRoleError("Organization / Authority name is required");
      return;
    }
    if (roleForm.categories.length === 0) {
      setRoleError("Please select at least one category to handle");
      return;
    }
    setRoleError("");
    setLoading(roleModal.userId);
    const result = await updateUserRoleWithDetails({
      userId: roleModal.userId,
      role: roleModal.newRole,
      organization: roleForm.organization,
      authorityType: roleModal.newRole as "ngo" | "authority",
      categories: roleForm.categories,
      contactPhone: roleForm.contactPhone,
      address: roleForm.address,
    });
    if (result.success) {
      setRoleModal(null);
      setLoading(null);
      window.location.reload();
    } else {
      setRoleError(result.error || "Failed to update role");
      setLoading(null);
    }
  };

  const toggleCategory = (cat: string) => {
    setRoleForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
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
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2"
          />
        </div>
      </div>

      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>
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
                        <p className="text-sm font-medium text-white">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-[140px]">
                      <Dropdown
                        value={u.role}
                        onChange={(val) => handleRoleChange(u._id, val, u)}
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
                  <td className="px-4 py-3">
                    {u.organization ? (
                      <span className="text-sm text-slate-300">
                        {u.organization}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setConfirmDelete(u._id)}
                      disabled={loading === u._id}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400">
                      {loading === u._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">No users found.</div>
        )}
      </div>

      {/* Role Promotion Modal — shown when promoting to authority/ngo */}
      {roleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setRoleModal(null)}>
          <div
            className="w-full max-w-lg glass-card p-6 m-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Shield className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Promote to {roleModal.newRole === "ngo" ? "NGO" : "Authority"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {roleModal.userName} • {roleModal.userEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleModal(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {roleError && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {roleError}
              </div>
            )}

            <div className="space-y-4">
              {/* Organization Name */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {roleModal.newRole === "ngo" ? "NGO Name" : "Authority / Department Name"} *
                </label>
                <input
                  type="text"
                  value={roleForm.organization}
                  onChange={(e) =>
                    setRoleForm((p) => ({ ...p, organization: e.target.value }))
                  }
                  className="input-field"
                  placeholder={
                    roleModal.newRole === "ngo"
                      ? "e.g., Green Earth Foundation"
                      : "e.g., Municipal Water Board"
                  }
                />
              </div>

              {/* Categories they handle */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Categories Handled *
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Select the issue categories this {roleModal.newRole === "ngo" ? "NGO" : "authority"} will handle. Complaints in these categories can be auto-assigned.
                </p>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const selected = roleForm.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-sm font-medium border transition-all",
                          selected
                            ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                            : "bg-slate-800/50 text-slate-400 border-white/5 hover:border-white/20 hover:text-white",
                        )}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={roleForm.contactPhone}
                  onChange={(e) =>
                    setRoleForm((p) => ({ ...p, contactPhone: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g., +92 300 1234567"
                />
              </div>

              {/* Address */}
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Office Address
                </label>
                <input
                  type="text"
                  value={roleForm.address}
                  onChange={(e) =>
                    setRoleForm((p) => ({ ...p, address: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g., Block C, Civic Center, Islamabad"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRoleModal(null)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleRoleSubmit}
                  disabled={loading === roleModal.userId}
                  className="btn-primary flex-1">
                  {loading === roleModal.userId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Promote to {roleModal.newRole === "ngo" ? "NGO" : "Authority"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
