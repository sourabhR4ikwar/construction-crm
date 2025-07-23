"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, Upload, Clock, User, FileText } from "lucide-react";

interface DocumentVersion {
  id: string;
  version: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  storageKey: string;
  checksum: string | null;
  versionNotes: string | null;
  createdAt: Date;
  uploadedBy: string;
}

interface DocumentWithVersions {
  id: string;
  name: string;
  description: string | null;
  type: string;
  currentVersion: string;
  versions: DocumentVersion[];
}

interface DocumentVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentWithVersions | null;
  onUploadNewVersion: (documentId: string) => void;
  onDownloadVersion: (documentId: string, version: string) => void;
  onPreviewVersion: (documentId: string, version: string) => void;
}

export function DocumentVersionsDialog({
  open,
  onOpenChange,
  document,
  onUploadNewVersion,
  onDownloadVersion,
  onPreviewVersion,
}: DocumentVersionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!document) return null;

  const formatFileSize = (bytes: string) => {
    const numBytes = parseInt(bytes);
    if (numBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    } else if (mimeType === "application/pdf") {
      return "📄";
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return "📝";
    } else if (mimeType.includes("sheet") || mimeType.includes("excel")) {
      return "📊";
    } else if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
      return "📊";
    } else if (mimeType === "text/plain") {
      return "📋";
    } else if (mimeType === "application/zip") {
      return "🗜️";
    }
    return "📁";
  };

  const handleDownload = async (version: DocumentVersion) => {
    setIsLoading(true);
    try {
      await onDownloadVersion(document.id, version.version);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (version: DocumentVersion) => {
    setIsLoading(true);
    try {
      await onPreviewVersion(document.id, version.version);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort versions by version number (descending)
  const sortedVersions = [...document.versions].sort((a, b) => 
    parseInt(b.version) - parseInt(a.version)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.name} - Versions
          </DialogTitle>
          {document.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {document.description}
            </p>
          )}
        </DialogHeader>

        <div className="flex justify-between items-center py-2 border-b">
          <div className="text-sm text-muted-foreground">
            {document.versions.length} version{document.versions.length !== 1 ? 's' : ''} available
          </div>
          <Button 
            size="sm"
            onClick={() => onUploadNewVersion(document.id)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Version
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {sortedVersions.map((version) => (
            <Card key={version.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {getFileIcon(version.mimeType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{version.fileName}</h4>
                      <Badge 
                        variant={version.version === document.currentVersion ? "default" : "secondary"}
                        className="flex-shrink-0"
                      >
                        v{version.version}
                        {version.version === document.currentVersion && " (Current)"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {version.createdAt.toLocaleDateString()} at {version.createdAt.toLocaleTimeString()}
                        </span>
                        <span>{formatFileSize(version.fileSize)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Uploaded by {version.uploadedBy}
                      </div>
                    </div>
                    
                    {version.versionNotes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Notes:</strong> {version.versionNotes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {version.mimeType.startsWith("image/") || version.mimeType === "application/pdf" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(version)}
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : null}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(version)}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {document.versions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No versions uploaded yet</p>
              <Button 
                className="mt-4"
                onClick={() => onUploadNewVersion(document.id)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First Version
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}