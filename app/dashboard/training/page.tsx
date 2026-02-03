"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";

interface TrainingDocument {
  id: string;
  name: string;
  filename: string;
  type: "docx" | "xlsx" | "pptx" | "png" | "mp3" | "pdf";
  category: string;
  description?: string;
}

const trainingDocuments: TrainingDocument[] = [
  // Main Documents
  {
    id: "1",
    name: "ProTech Roofing Training Week",
    filename: "ProTech Roofing Training Week.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Complete training presentation for new team members",
  },
  {
    id: "2",
    name: "Roofing Sales 101",
    filename: "Roofing Sales 101.pptx",
    type: "pptx",
    category: "Core Training",
    description: "Fundamentals of roofing sales",
  },
  {
    id: "3",
    name: "ProTech Roofing Call Script",
    filename: "ProTech Roofing Call Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Standard call script for customer outreach",
  },
  {
    id: "4",
    name: "ProTech Roofing Call Script (Alternate)",
    filename: "ProTech Roofing Call Script (Evan Alternate).docx",
    type: "docx",
    category: "Scripts",
    description: "Alternative call script approach",
  },
  {
    id: "5",
    name: "Fronter Script",
    filename: "Fronter Script.docx",
    type: "docx",
    category: "Scripts",
    description: "Script for fronter role",
  },
  {
    id: "6",
    name: "ProTech Client Questions",
    filename: "ProTech Client Questions.docx",
    type: "docx",
    category: "Reference",
    description: "Common client questions and answers",
  },
  {
    id: "7",
    name: "ProTech Price Guide",
    filename: "ProTech Price Guide.xlsx",
    type: "xlsx",
    category: "Reference",
    description: "Pricing reference guide",
  },
  {
    id: "8",
    name: "Pitch Chart",
    filename: "Pitch Chart.png",
    type: "png",
    category: "Reference",
    description: "Visual pitch reference chart",
  },
  {
    id: "9",
    name: "Roof Diagram",
    filename: "roof-diagram.png",
    type: "png",
    category: "Reference",
    description: "Roof structure diagram",
  },
  // Informational Lessons
  {
    id: "10",
    name: "Auxiliary Tips, Tricks, and Information",
    filename: "informational-lessons/Auxiliary Tips, Trick, and Information.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Additional tips and helpful information",
  },
  {
    id: "11",
    name: "Roofing Types and Differences",
    filename: "informational-lessons/Roofing Types and Differences.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Overview of different roofing types",
  },
  {
    id: "12",
    name: "Selling Points",
    filename: "informational-lessons/Selling Points.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Key selling points for roofing services",
  },
  {
    id: "13",
    name: "Training Links",
    filename: "informational-lessons/Training Links.docx",
    type: "docx",
    category: "Informational Lessons",
    description: "Collection of useful training resources",
  },
  // Practice Sheets
  {
    id: "14",
    name: "Practice Measurements",
    filename: "practice-sheets/Practice Measurements.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Measurement practice exercises",
  },
  {
    id: "15",
    name: "Practice Measurements II",
    filename: "practice-sheets/Practice Measurements II.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Advanced measurement practice",
  },
  {
    id: "16",
    name: "Roofing Knowledge Inventory",
    filename: "practice-sheets/Roofing Knowledge Inventory.docx",
    type: "docx",
    category: "Practice Sheets",
    description: "Self-assessment quiz",
  },
  // Training Calls
  {
    id: "17",
    name: "Training Call - Evan Clark & Delores Epps",
    filename: "training-calls/Evan Clark Delores Epps.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
  },
  {
    id: "18",
    name: "Training Call - Evan Clark & Elizabeth Mazzola Part 1",
    filename: "training-calls/Evan Clark Elizabeth Mazzola Part 1.mp3",
    type: "mp3",
    category: "Training Calls",
    description: "Recorded training call example",
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

const typeIcons: Record<string, ReactNode> = {
  docx: (
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
  pptx: (
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
  mp3: (
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

export default function TrainingPage() {
  const [selectedDoc, setSelectedDoc] = useState<TrainingDocument | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const getFileUrl = (filename: string) => {
    return `/training/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
  };

  const handleView = (doc: TrainingDocument) => {
    setSelectedDoc(doc);
  };

  const handleDownload = (doc: TrainingDocument) => {
    const link = document.createElement("a");
    link.href = getFileUrl(doc.filename);
    link.download = doc.filename.split("/").pop() || doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeViewer = () => {
    setSelectedDoc(null);
  };

  const renderViewer = () => {
    if (!selectedDoc) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              {typeIcons[selectedDoc.type]}
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDoc.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
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
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
          <div className="flex-1 overflow-hidden bg-gray-100 p-4">
            {selectedDoc.type === "png" ? (
              <div className="relative h-full w-full">
                <Image
                  src={getFileUrl(selectedDoc.filename)}
                  alt={selectedDoc.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : selectedDoc.type === "mp3" ? (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-pink-100">
                  {typeIcons.mp3}
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedDoc.name}
                </h3>
                <audio
                  controls
                  className="w-full max-w-md"
                  src={getFileUrl(selectedDoc.filename)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : selectedDoc.type === "docx" || selectedDoc.type === "xlsx" || selectedDoc.type === "pptx" ? (
              <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
                  {typeIcons[selectedDoc.type]}
                </div>
                <h3 className="text-xl font-medium text-gray-900">
                  {selectedDoc.name}
                </h3>
                <p className="text-gray-500">
                  This file type cannot be previewed in the browser.
                </p>
                <a
                  href={getFileUrl(selectedDoc.filename)}
                  download
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download File
                </a>
              </div>
            ) : (
              <iframe
                src={getFileUrl(selectedDoc.filename)}
                className="h-full w-full rounded-lg border-0 bg-white"
                title={selectedDoc.name}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Materials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Access training documents, scripts, and resources
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const categoryDocs = trainingDocuments.filter(
          (doc) => doc.category === category
        );
        if (categoryDocs.length === 0) return null;

        return (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {category}
            </h2>

            {viewMode === "list" ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categoryDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {typeIcons[doc.type]}
                            <div>
                              <div className="font-medium text-gray-900">
                                {doc.name}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-gray-500">
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase text-gray-600">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(doc)}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                              Download
                            </button>
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
                    className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-primary-300 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      {typeIcons[doc.type]}
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase text-gray-600">
                        {doc.type}
                      </span>
                    </div>
                    <h3 className="mb-1 font-medium text-gray-900">
                      {doc.name}
                    </h3>
                    {doc.description && (
                      <p className="mb-4 text-sm text-gray-500">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
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
    </div>
  );
}
