"use client";

import { useState, useEffect } from "react";
import { getDocumentDownloadUrlAction } from "./document-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Loader2 } from "lucide-react";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  version?: string;
  fileName?: string;
  mimeType?: string;
  onDownload?: () => void;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  documentId,
  version,
  fileName,
  mimeType,
  onDownload,
}: DocumentPreviewDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentData, setDocumentData] = useState<{
    fileName: string;
    mimeType: string;
    fileSize: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreviewContent = async () => {
      if (!documentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getDocumentDownloadUrlAction(documentId, version);
        
        if (result.success && result.data.downloadUrl) {
          setPreviewUrl(result.data.downloadUrl);
          setDocumentData({
            fileName: result.data.fileName,
            mimeType: result.data.mimeType,
            fileSize: result.data.fileSize,
          });
        } else {
          setError(result.error || "Failed to load document preview");
        }
      } catch (err) {
        console.error("Failed to load preview:", err);
        setError("Failed to load document preview");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && documentId) {
      loadPreviewContent();
    } else {
      // Clean up preview URL when dialog closes
      setPreviewUrl(null);
      setDocumentData(null);
      setError(null);
    }
  }, [open, documentId, version]);


  const canPreview = (mimeType?: string) => {
    if (!mimeType) return false;
    return mimeType.startsWith("image/") || mimeType === "application/pdf";
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">❌</div>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    const displayFileName = documentData?.fileName || fileName;
    const displayMimeType = documentData?.mimeType || mimeType;

    if (!canPreview(displayMimeType)) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-muted-foreground mb-4">
              Preview not available for this file type
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {displayFileName && `File: ${displayFileName}`}
            </p>
            {documentData?.fileSize && (
              <p className="text-xs text-muted-foreground mb-4">
                Size: {(parseInt(documentData.fileSize) / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            {onDownload && (
              <Button onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Render actual preview based on mimeType and previewUrl
    if (displayMimeType?.startsWith("image/") && previewUrl) {
      return (
        <div className="flex items-center justify-center min-h-96 p-4">
          <img 
            src={previewUrl} 
            alt={displayFileName || "Document preview"}
            className="max-w-full max-h-96 object-contain rounded border"
            onError={() => setError("Failed to load image preview")}
          />
        </div>
      );
    }

    if (displayMimeType === "application/pdf" && previewUrl) {
      return (
        <div className="w-full h-96">
          <embed
            src={previewUrl}
            type="application/pdf"
            className="w-full h-full rounded border"
            onError={() => setError("Failed to load PDF preview")}
          />
        </div>
      );
    }

    // If we have a preview URL but can't render it directly, show download option
    if (previewUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-muted-foreground mb-4">
              Preview not available for this file type
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {displayFileName && `File: ${displayFileName}`}
            </p>
            <div className="flex gap-2 justify-center">
              {onDownload && (
                <Button onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              )}
              <Button variant="outline" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="truncate">
                {documentData?.fileName || fileName || "Document Preview"}
              </DialogTitle>
              {version && (
                <Badge variant="outline">
                  v{version}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onDownload && (
                <Button size="sm" variant="outline" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {previewUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download={documentData?.fileName || fileName}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}