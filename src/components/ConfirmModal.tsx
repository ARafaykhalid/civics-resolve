"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  loading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined}>
      <div className="w-full max-w-sm glass-card p-6 m-4 text-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-primary bg-rose-500 hover:bg-rose-600 text-white flex-1 border-none flex items-center justify-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
