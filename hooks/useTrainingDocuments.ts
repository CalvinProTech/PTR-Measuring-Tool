"use client";

import { useState, useEffect, useCallback } from "react";
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
}

export function useTrainingDocuments(): UseTrainingDocumentsReturn {
  const [documents, setDocuments] = useState<TrainingDocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Upload a new document
  const uploadDocument = useCallback(
    async (options: UploadOptions): Promise<TrainingDocumentData | null> => {
      try {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", options.file);
        formData.append("name", options.name);
        formData.append("category", options.category);
        if (options.description) {
          formData.append("description", options.description);
        }

        const response = await fetch("/api/training", {
          method: "POST",
          body: formData,
        });

        const data: TrainingDocumentResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to upload document");
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
  };
}
