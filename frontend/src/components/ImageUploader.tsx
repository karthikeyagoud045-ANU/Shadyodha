"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { fileSize } from "@/lib/utils";

export function ImageUploader({
  onFile,
  previewUrl,
  meta,
}: {
  onFile: (file: File, url: string) => void;
  previewUrl: string | null;
  meta?: { name: string; size: number; status: string };
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        alert("Maximum file size is 10 MB.");
        return;
      }
      onFile(file, URL.createObjectURL(file));
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/tiff": [".tif", ".tiff"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragActive ? "border-ink-900 bg-ink-50" : "border-ink-200 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-8 w-8 animate-float text-ink-400" />
        <p className="font-semibold">Drop fundus image here</p>
        <p className="mt-1 text-sm text-ink-500">JPG, PNG or TIFF · max 10 MB</p>
      </div>
      {previewUrl && (
        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Fundus preview" className="h-56 w-full rounded-2xl object-cover" />
          <div className="space-y-2 rounded-2xl border border-ink-200 bg-white p-4 text-sm">
            <p>
              <span className="text-ink-500">File</span> · {meta?.name}
            </p>
            <p>
              <span className="text-ink-500">Size</span> · {meta ? fileSize(meta.size) : "—"}
            </p>
            <p>
              <span className="text-ink-500">Resolution</span> · 2048 × 1536 (estimated)
            </p>
            <p>
              <span className="text-ink-500">Upload</span> · {meta?.status ?? "Ready"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
