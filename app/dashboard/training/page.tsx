"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTrainingDocuments } from "@/hooks/useTrainingDocuments";
import { UploadTrainingModal } from "@/components/UploadTrainingModal";
import type { TrainingDocumentData } from "@/types";

interface TrainingDocument {
  id: string;
  name: string;
  filename: string;
  type: string;
  category: string;
  description?: string | null;
  isUploaded?: boolean; // true for API documents, false for static
}

// Static training documents (legacy - stored in public/training/)
const staticTrainingDocuments: TrainingDocument[] = [
  // Main Documents
  {
    id: "static-1",
    name: "ProTech Roofing Training Week",
    filename: "ProTech Roofing Training Week.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Complete training presentation for new team members",
    isUploaded: false,
  },
  {
    id: "static-2",
    name: "Roofing Sales 101",
    filename: "Roofing Sales 101.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Fundamentals of roofing sales",
    isUploaded: false,
  },
  {
    id: "static-3",
    name: "ProTech Roofing Call Script",
    filename: "ProTech Roofing Call Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Standard call script for customer outreach",
    isUploaded: false,
  },
  {
    id: "static-4",
    name: "ProTech Roofing Call Script (Alternate)",
    filename: "ProTech Roofing Call Script (Evan Alternate).docx",
    type: "docx",
    category: "Scripts",
    description: "Alternative call script approach",
    isUploaded: false,
  },
  {
    id: "static-5",
    name: "Fronter Script",
    filename: "Fronter Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Script for fronter role",
    isUploaded: false,
  },
  {
    id: "static-6",
    name: "ProTech Client Questions",
    filename: "ProTech Client Questions.docx",
    type: "docx",
    category: "Reference",
    description: "Common client questions and answers",
    isUploaded: false,
  },
  {
    id: "static-7",
    name: "ProTech Price Guide",
    filename: "ProTech Price Guide.xlsx",
    type: "xlsx",
    category: "Reference",
    description: "Pricing reference guide",
    isUploaded: false,
  },
  {
    id: "static-8",
    name: "Pitch Chart",
    filename: "Pitch Chart.png",
    type: "png",
    category: "Reference",
    description: "Visual pitch reference chart",
    isUploaded: false,
  },
  {
    id: "static-9",
    name: "Roof Diagram",
    filename: "roof-diagram.png",
    type: "png",
    category: "Reference",
    description: "Roof structure diagram",
    isUploaded: false,
  },
  // Informational Lessons
  {
    id: "static-10",
    name: "Auxiliary Tips, Tricks, and Information",
    filename: "informational-lessons/Auxiliary Tips, Trick, and Information.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Additional tips and helpful information",
    isUploaded: false,
  },
  {
    id: "static-11",
    name: "Roofing Types and Differences",
    filename: "informational-lessons/Roofing Types and Differences.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Overview of different roofing types",
    isUploaded: false,
  },
  {
    id: "static-12",
    name: "Selling Points",
    filename: "informational-lessons/Selling Points.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Key selling points for roofing services",
    isUploaded: false,
  },
  {
    id: "static-13",
    name: "Training Links",
    filename: "informational-lessons/Training Links.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Collection of useful training resources",
    isUploaded: false,
  },
  // Practice Sheets
  {
    id: "static-14",
    name: "Practice Measurements",
    filename: "practice-sheets/Practice Measurements.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Measurement practice exercises",
    isUploaded: false,
  },
  {
    id: "static-15",
    name: "Practice Measurements II",
    filename: "practice-sheets/Practice Measurements II.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Advanced measurement practice",
    isUploaded: false,
  },
  {
    id: "static-16",
    name: "Roofing Knowledge Inventory",
    filename: "practice-sheets/Roofing Knowledge Inventory.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Self-assessment quiz",
    isUploaded: false,
  },
  // Training Calls
  {
    id: "static-17",
    name: "Training Call - Evan Clark & Delores Epps",
    filename: "training-calls/Evan Clark Delores Epps.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
    isUploaded: false,
  },
  {
    id: "static-18",
    name: "Training Call - Evan Clark & Elizabeth Mazzola Part 1",
    filename: "training-calls/Evan Clark Elizabeth Mazzola Part 1.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
    isUploaded: false,
  },
];

const categories = [
  "Core Training",
  "Scripts",
  "Reference",
  "Informational Lessons",
  "Practice Sheets",
  "Training Calls",
];

const CATEGORY_COLORS: Record<string, { accent: string; bg: string; text: string }> = {
  "Core Training": { accent: "bg-primary-500", bg: "bg-primary-50", text: "text-primary-700" },
  "Scripts": { accent: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  "Reference": { accent: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  "Informational Lessons": { accent: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  "Practice Sheets": { accent: "bg-cyan-500", bg: "bg-cyan-50", text: "text-cyan-700" },
  "Training Calls": { accent: "bg-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
};

const typeIcons: Record<string, ReactNode> = {
  docx: (
    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M8 12h8v2H8zm0 4h8v2H8z"/>
    </svg>
  ),
  doc: (
    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M8 12h8v2H8zm0 4h8v2H8z"/>
    </svg>
  ),
  xlsx: (
    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M8 12h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 0h3v2h-3z"/>
    </svg>
  ),
  xls: (
    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M8 12h3v2H8zm5 0h3v2h-3zm-5 4h3v2H8zm5 0h3v2h-3z"/>
    </svg>
  ),
  pptx: (
    <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M9 12h4a2 2 0 0 1 0 4h-2v2H9v-6zm2 3h2a.5.5 0 0 0 0-1h-2v1z"/>
    </svg>
  ),
  ppt: (
    <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
      <path d="M9 12h4a2 2 0 0 1 0 4h-2v2H9v-6zm2 3h2a.5.5 0 0 0 0-1h-2v1z"/>
    </svg>
  ),
  png: (
    <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V5h14v14H5z"/>
      <path d="M14.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
    </svg>
  ),
  jpg: (
    <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V5h14v14H5z"/>
      <path d="M14.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
    </svg>
  ),
  jpeg: (
    <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V5h14v14H5z"/>
      <path d="M14.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
    </svg>
  ),
  gif: (
    <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM5 19V5h14v14H5z"/>
      <path d="M14.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
    </svg>
  ),
  mp3: (
    <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ),
  mp4: (
    <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
    </svg>
  ),
  wav: (
    <svg className="h-6 w-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ),
  pdf: (
    <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
    </svg>
  ),
};

// Default icon for unknown types
const defaultIcon = (
  <svg className="h-6 w-6 text-neutral-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
  </svg>
);

export default function TrainingPage() {
  const { user } = useUser();
  const isOwner = user?.publicMetadata?.role === "owner";

  const {
    documents: uploadedDocuments,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    isUploading,
    isDeleting,
    uploadProgress,
  } = useTrainingDocuments();

  const [selectedDoc, setSelectedDoc] = useState<TrainingDocument | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Combine static and uploaded documents
  const allDocuments: TrainingDocument[] = [
    ...staticTrainingDocuments,
    ...uploadedDocuments.map((doc: TrainingDocumentData) => ({
      id: doc.id,
      name: doc.name,
      filename: doc.storedName,
      type: doc.type,
      category: doc.category,
      description: doc.description,
      isUploaded: true,
    })),
  ];

  const getFileUrl = (doc: TrainingDocument) => {
    if (doc.isUploaded) {
      // For uploaded docs, filename contains the Vercel Blob URL
      return doc.filename;
    }
    return `/training/${encodeURIComponent(doc.filename).replace(/%2F/g, "/")}`;
  };

  const handleView = (doc: TrainingDocument) => {
    setSelectedDoc(doc);
  };

  const handleDownload = (doc: TrainingDocument) => {
    const link = document.createElement("a");
    link.href = getFileUrl(doc);
    link.download = doc.filename.split("/").pop() || doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeViewer = () => {
    setSelectedDoc(null);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteDocument(id);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const handleUpload = async (options: {
    file: File;
    name: string;
    category: string;
    description?: string;
  }) => {
    return await uploadDocument(options);
  };

  const getIcon = (type: string): ReactNode => {
    return typeIcons[type.toLowerCase()] || defaultIcon;
  };

  const renderViewer = () => {
    if (!selectedDoc) return null;

    const isImage = ["png", "jpg", "jpeg", "gif"].includes(selectedDoc.type.toLowerCase());
    const isAudio = ["mp3", "wav"].includes(selectedDoc.type.toLowerCase());
    const isVideo = ["mp4"].includes(selectedDoc.type.toLowerCase());
    const isPdf = selectedDoc.type.toLowerCase() === "pdf";
    const isOfficeDoc = ["docx", "doc", "xlsx", "xls", "pptx", "ppt"].includes(selectedDoc.type.toLowerCase());

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
        <div className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-elevated animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-3">
              {getIcon(selectedDoc.type)}
              <h2 className="font-display text-lg font-semibold text-neutral-800">
                {selectedDoc.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
              <button
                onClick={closeViewer}
                className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <svg
                  className="h-6 w-6"
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
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-neutral-100 p-4 rounded-b-2xl">
            {isImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={getFileUrl(selectedDoc)}
                  alt={selectedDoc.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : isAudio ? (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-pink-100">
                  {getIcon(selectedDoc.type)}
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-800">
                  {selectedDoc.name}
                </h3>
                <audio
                  controls
                  className="w-full max-w-md"
                  src={getFileUrl(selectedDoc)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : isVideo ? (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <video
                  controls
                  className="max-h-full max-w-full rounded-xl"
                  src={getFileUrl(selectedDoc)}
                >
                  Your browser does not support the video element.
                </video>
              </div>
            ) : isPdf ? (
              <iframe
                src={getFileUrl(selectedDoc)}
                className="h-full w-full rounded-xl border-0 bg-white"
                title={selectedDoc.name}
              />
            ) : isOfficeDoc ? (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-neutral-200/50">
                  {getIcon(selectedDoc.type)}
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-800">
                  {selectedDoc.name}
                </h3>
                <p className="text-neutral-500">
                  This file type cannot be previewed in the browser.
                </p>
                <a
                  href={getFileUrl(selectedDoc)}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </a>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-neutral-200/50">
                  {getIcon(selectedDoc.type)}
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-800">
                  {selectedDoc.name}
                </h3>
                <p className="text-neutral-500">
                  Preview not available for this file type.
                </p>
                <a
                  href={getFileUrl(selectedDoc)}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-3 text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete confirmation modal
  const renderDeleteConfirm = () => {
    if (!deleteConfirmId) return null;
    const doc = allDocuments.find((d) => d.id === deleteConfirmId);
    if (!doc) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated animate-scale-in">
          <h3 className="font-display text-lg font-semibold text-neutral-800">Delete Document</h3>
          <p className="mt-2 text-neutral-600">
            Are you sure you want to delete &quot;{doc.name}&quot;? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              disabled={isDeleting}
              className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
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
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-800">Training Materials</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Access training documents, scripts, and resources
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isOwner && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/30"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload Document
            </button>
          )}
          <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-neutral-800 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 rounded-xl bg-primary-50 p-4 text-primary-700 border border-primary-200/60">
          Loading documents...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700 border border-red-200/60">
          {error}
        </div>
      )}

      {/* Categories */}
      {categories.map((category) => {
        const categoryDocs = allDocuments.filter(
          (doc) => doc.category === category
        );
        if (categoryDocs.length === 0) return null;
        const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS["Core Training"];

        return (
          <div key={category} className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className={`h-5 w-1 rounded-full ${colors.accent}`} />
              <h2 className="font-display text-lg font-semibold text-neutral-800">
                {category}
              </h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                {categoryDocs.length}
              </span>
            </div>

            {viewMode === "list" ? (
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {categoryDocs.map((doc) => (
                      <tr key={doc.id} className="transition-colors hover:bg-primary-50/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getIcon(doc.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-800">
                                  {doc.name}
                                </span>
                                {doc.isUploaded && (
                                  <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                                    Uploaded
                                  </span>
                                )}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-neutral-500">
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium uppercase text-neutral-600">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(doc)}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                            >
                              Download
                            </button>
                            {isOwner && doc.isUploaded && (
                              <button
                                onClick={() => setDeleteConfirmId(doc.id)}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="card-hover group rounded-xl p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon(doc.type)}
                        {doc.isUploaded && (
                          <span className="inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <span className="inline-flex rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium uppercase text-neutral-600">
                        {doc.type}
                      </span>
                    </div>
                    <h3 className="mb-1 font-medium text-neutral-800">
                      {doc.name}
                    </h3>
                    {doc.description && (
                      <p className="mb-4 text-sm text-neutral-500">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-md"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition-colors hover:bg-neutral-50"
                        title="Download"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                      {isOwner && doc.isUploaded && (
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                          title="Delete"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Viewer Modal */}
      {renderViewer()}

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirm()}

      {/* Upload Modal */}
      <UploadTrainingModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}
