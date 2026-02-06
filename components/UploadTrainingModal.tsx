"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "doc",
  "xls",
  "ppt",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "mp3",
  "mp4",
  "wav",
];

const CATEGORIES = [
  "Core Training",
  "Scripts",
  "Reference",
  "Informational Lessons",
  "Practice Sheets",
  "Training Calls",
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

interface UploadTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (options: {
    file: File;
    name: string;
    category: string;
    description?: string;
  }) => Promise<unknown>;
  isUploading: boolean;
  uploadProgress?: number;
}

export function UploadTrainingModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  uploadProgress = 0,
}: UploadTrainingModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef(name);
  useEffect(() => { nameRef.current = name; }, [name]);

  const resetForm = useCallback(() => {
    setFile(null);
    setName("");
    setCategory(CATEGORIES[0]);
    setDescription("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  }, [isUploading, onClose, resetForm]);

  const validateFile = useCallback((selectedFile: File): string | null => {
    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `File type .${extension} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size exceeds 200MB limit";
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setFile(selectedFile);

      // Auto-fill name from filename if empty
      if (!nameRef.current) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    },
    [validateFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a document name");
      return;
    }

    const result = await onUpload({
      file,
      name: name.trim(),
      category,
      description: description.trim() || undefined,
    });

    if (result) {
      resetForm();
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-elevated animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="upload-modal-title" className="font-display text-lg font-semibold text-neutral-800">
            Upload Training Document
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* File Drop Zone */}
          <div
            className={`mb-4 rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary-500 bg-primary-50 scale-[1.01]"
                : file
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-neutral-300 hover:border-neutral-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={[
                ...ALLOWED_EXTENSIONS.map((ext) => `.${ext}`),
                "video/mp4",
                "video/*",
                "audio/*",
                "image/*",
                "application/pdf",
              ].join(",")}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-neutral-800">{file.name}</p>
                  <p className="text-sm text-neutral-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="ml-2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <label
                  htmlFor="file-upload"
                  className="mt-2 block cursor-pointer text-sm text-neutral-600"
                >
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </label>
                <p className="mt-1 text-xs text-neutral-400">
                  PDF, Word, Excel, PowerPoint, Images, Audio, Video (max 200MB)
                </p>
              </>
            )}
          </div>

          {/* Document Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-600"
            >
              Document Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Enter document name"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-neutral-600"
            >
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-600"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-xl border border-neutral-200 px-4 py-2.5 shadow-sm transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Brief description of the document"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-neutral-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-shimmer"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/30 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isUploading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading {uploadProgress}%
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
