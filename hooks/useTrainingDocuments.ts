"use client";

import { useState, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import type {
  TrainingDocumentData,
  TrainingDocumentsResponse,
  TrainingDocumentResponse,
} from "@/types";

interface UploadOptions {
  file: File;
  name: string;
  category: string;
  description?: string;
}

interface UseTrainingDocumentsReturn {
  documents: TrainingDocumentData[];
  isLoading: boolean;
  error: string | null;
  uploadDocument: (options: UploadOptions) => Promise<TrainingDocumentData | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  refreshDocuments: () => Promise<void>;
  isUploading: boolean;
  isDeleting: boolean;
  uploadProgress: number;
}

export function useTrainingDocuments(): UseTrainingDocumentsReturn {
  const [documents, setDocuments] = useState<TrainingDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all documents from the API
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/training");
      const data: TrainingDocumentsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch documents");
      }

      setDocuments(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(message);
      console.error("[useTrainingDocuments] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload a new document using client-side upload to Vercel Blob
  const uploadDocument = useCallback(
    async (options: UploadOptions): Promise<TrainingDocumentData | null> => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = options.file.name
          .replace(/[^a-zA-Z0-9.-]/g, "_")
          .substring(0, 100);
        const blobPath = `training/${timestamp}_${sanitizedName}`;

        // Upload directly to Vercel Blob (bypasses serverless function limits)
        const blob = await upload(blobPath, options.file, {
          access: "public",
          handleUploadUrl: "/api/training/upload",
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round(progress.percentage));
          },
        });

        // Now save the metadata to our database
        const response = await fetch("/api/training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: options.name,
            filename: options.file.name,
            blobUrl: blob.url,
            type: options.file.name.split(".").pop()?.toLowerCase() || "",
            category: options.category,
            description: options.description,
            fileSize: options.file.size,
          }),
        });

        const data: TrainingDocumentResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to save document");
        }

        // Add the new document to the list
        if (data.data) {
          setDocuments((prev) => [data.data!, ...prev]);
          return data.data;
        }

        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload document";
        setError(message);
        console.error("[useTrainingDocuments] Upload error:", err);
        return null;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  // Delete a document
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch("/api/training", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete document");
      }

      // Remove the document from the list
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete document";
      setError(message);
      console.error("[useTrainingDocuments] Delete error:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments,
    isUploading,
    isDeleting,
    uploadProgress,
  };
}
