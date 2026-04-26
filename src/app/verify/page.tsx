"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyUserRegistration } from "@/actions/auth";
import { ShieldCheck, Loader2 } from "lucide-react";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is missing. Please try registering again.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const result = await verifyUserRegistration(email, code);
      if (result.success) {
        setSuccess("Account verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 2000);
      } else {
        setError(result.error || "Verification failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Your Account</h1>
          <p className="mt-1 text-sm text-slate-400">
            We sent a verification code to <strong className="text-white">{email}</strong>
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">{success}</div>
            )}
            <div>
              <label htmlFor="code" className="label-text text-center block mb-2">Enter 6-digit Code</label>
              <input 
                id="code" 
                type="text" 
                maxLength={6}
                value={code} 
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                className="input-field text-center text-2xl tracking-widest font-mono" 
                placeholder="000000" 
                required 
              />
            </div>
            
            <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <VerifyForm />
    </Suspense>
  );
}
