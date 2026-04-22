"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ images, onChange, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxFiles - images.length;
    if (remaining <= 0) return;
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append("files", file));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.data?.urls) {
        onChange([...images, ...data.data.urls]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, onChange]);

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        className={`relative rounded-xl border-2 border-dashed transition-all ${dragOver ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}
      >
        <label className="flex cursor-pointer flex-col items-center gap-3 px-6 py-8">
          {uploading ? <Loader2 className="h-8 w-8 animate-spin text-indigo-400" /> : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
              <Upload className="h-6 w-6 text-indigo-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">{uploading ? "Uploading..." : "Drop images here or click to upload"}</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP up to 5MB • Max {maxFiles} files</p>
          </div>
          <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="absolute inset-0 cursor-pointer opacity-0" disabled={uploading || images.length >= maxFiles} />
        </label>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-white/5">
              <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <button type="button" onClick={() => removeImage(index)} className="absolute right-1.5 top-1.5 rounded-full bg-red-500 p-1 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {images.length < maxFiles && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-slate-600">
              <ImageIcon className="h-6 w-6 text-slate-600" />
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files)} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
