"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, QrCode, Share2 } from "lucide-react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#00000000"
        }
      }).then(setQrCodeUrl).catch(console.error);
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-indigo-400" /> Share Link
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <p className="text-sm text-center text-slate-300 mb-6 font-medium">
            Scan to view <span className="text-indigo-400">&quot;{title}&quot;</span>
          </p>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-xl mb-6 shadow-xl shadow-indigo-500/20">
            <div className="bg-slate-900 rounded-lg p-2">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-slate-500">
                  <QrCode className="h-8 w-8 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Page URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-slate-300 truncate font-mono">
                {url}
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  copied 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                )}
                title="Copy link"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
