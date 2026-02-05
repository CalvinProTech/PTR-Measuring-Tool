"use client";

import { useState, useRef, useCallback } from "react";

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
}

export function UploadTrainingModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}: UploadTrainingModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (!name) {
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    },
    [name, validateFile]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload Training Document
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
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
            className={`mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging
                ? "border-primary-500 bg-primary-50"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
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
                  className="h-8 w-8 text-green-600"
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
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
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
                  className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
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
                  className="mx-auto h-12 w-12 text-gray-400"
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
                  className="mt-2 block cursor-pointer text-sm text-gray-600"
                >
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, Word, Excel, PowerPoint, Images, Audio, Video (max 200MB)
                </p>
              </>
            )}
          </div>

          {/* Document Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Document Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter document name"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
              className="block text-sm font-medium text-gray-700"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Brief description of the document"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
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
                  Uploading...
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
