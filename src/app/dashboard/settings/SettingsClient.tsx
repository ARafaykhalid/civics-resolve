"use client";

import { useState } from "react";
import { Loader2, Lock, CheckCircle2, User } from "lucide-react";

export default function SettingsClient({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your profile and security preferences.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <User className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-medium text-white">Profile Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Name</label>
              <div className="input-field flex items-center text-white bg-slate-800/50">
                {user.name}
              </div>
            </div>
            <div>
              <label className="label-text">Email</label>
              <div className="input-field flex items-center text-white bg-slate-800/50">
                {user.email}
              </div>
            </div>
            <div>
              <label className="label-text">Role</label>
              <div className="input-field flex items-center text-white bg-slate-800/50 capitalize">
                {user.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <Lock className="h-5 w-5 text-rose-400" />
          </div>
          <h2 className="text-lg font-medium text-white">Change Password</h2>
        </div>
        
        <div className="p-6">
          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6 flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-sm font-medium">Password updated successfully</h3>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            <div>
              <label className="label-text">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label className="label-text">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters with a number and uppercase letter.</p>
            </div>
            
            <div>
              <label className="label-text">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto py-2.5 px-6">
              {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
