"use client";

import { useState, useEffect } from "react";
import { getProjectDocumentsAction, getDocumentDownloadUrlAction } from "./document-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, FileText, Download, Eye, MoreHorizontal, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateDocumentDialog } from "./create-document-dialog";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { DocumentVersionsDialog } from "./document-versions-dialog";
import { DocumentPreviewDialog } from "./document-preview-dialog";
import { useDocumentPermissions, canAccessDocument, canModifyDocument } from "@/hooks/use-document-permissions";

interface Document {
  id: string;
  name: string;
  description?: string;
  type: string;
  currentVersion: string;
  accessLevel: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface ProjectDocumentsTabProps {
  projectId: string;
}

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const { permissions } = useDocumentPermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedDocumentForVersions, setSelectedDocumentForVersions] = useState<Document | null>(null);
  const [selectedDocumentForPreview, setSelectedDocumentForPreview] = useState<{
    id: string;
    fileName: string;
    mimeType: string;
    version?: string;
  } | null>(null);

  // Load documents from server
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const result = await getProjectDocumentsAction(projectId);
        if (result.success) {
          setDocuments(result.data);
        } else {
          console.error("Failed to load documents:", result.error);
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [projectId]);

  // Get all unique tags from documents for filtering
  const allTags = Array.from(new Set(
    documents
      .filter(doc => doc.tags)
      .flatMap(doc => JSON.parse(doc.tags!))
  ));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !typeFilter || typeFilter === "all" || doc.type === typeFilter;
    const matchesTag = !tagFilter || tagFilter === "all" || (doc.tags && JSON.parse(doc.tags).includes(tagFilter));
    const hasAccess = canAccessDocument(doc.accessLevel, permissions.role);
    return matchesSearch && matchesType && matchesTag && hasAccess;
  });

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      drawings_plans: "Drawings/Plans",
      contracts: "Contracts",
      permits: "Permits",
      reports: "Reports",
      specifications: "Specifications",
      correspondence: "Correspondence",
      photos: "Photos",
      other: "Other"
    };
    return types[type] || type;
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public": return "bg-green-100 text-green-800";
      case "project_members": return "bg-blue-100 text-blue-800";
      case "admin_only": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleUploadNew = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsUploadDialogOpen(true);
  };

  const handleViewVersions = (document: Document) => {
    // In a real app, you'd fetch the document with versions
    const documentWithVersions = {
      ...document,
      versions: [
        {
          id: "v1",
          version: "1",
          fileName: `${document.name}.pdf`,
          fileSize: "2048576",
          mimeType: "application/pdf",
          storageKey: "projects/123/documents/file_v1_123456.pdf",
          checksum: null,
          versionNotes: "Initial version",
          createdAt: new Date("2024-01-15"),
          uploadedBy: "John Doe"
        }
      ]
    };
    setSelectedDocumentForVersions(documentWithVersions);
    setIsVersionsDialogOpen(true);
  };

  const handlePreviewDocument = (document: Document, version?: string) => {
    setSelectedDocumentForPreview({
      id: document.id,
      fileName: `${document.name}.pdf`,
      mimeType: "application/pdf",
      version: version || document.currentVersion,
    });
    setIsPreviewDialogOpen(true);
  };

  const handleDownloadVersion = async (documentId: string, version: string) => {
    try {
      const result = await getDocumentDownloadUrlAction(documentId, version);
      if (result.success && result.data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Failed to get download URL:", result.error);
      }
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  const handlePreviewVersion = async (documentId: string, version: string) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      handlePreviewDocument(document, version);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="drawings_plans">Drawings/Plans</SelectItem>
              <SelectItem value="contracts">Contracts</SelectItem>
              <SelectItem value="permits">Permits</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="specifications">Specifications</SelectItem>
              <SelectItem value="correspondence">Correspondence</SelectItem>
              <SelectItem value="photos">Photos</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {allTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {(searchQuery || (typeFilter && typeFilter !== "all") || (tagFilter && tagFilter !== "all")) && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("");
                setTagFilter("");
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
        {permissions.canWrite && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading documents...</p>
            </CardContent>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery || (typeFilter && typeFilter !== "all") || (tagFilter && tagFilter !== "all")
                  ? "No documents match your current filters." 
                  : "Get started by creating your first document."}
              </p>
              {!searchQuery && (!typeFilter || typeFilter === "all") && (!tagFilter || tagFilter === "all") && permissions.canWrite && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => {
            const canModify = canModifyDocument(document.accessLevel, permissions.role, document.createdBy);
            
            return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    {document.description && (
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewVersions(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Versions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreviewDocument(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Latest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadVersion(document.id, document.currentVersion)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Latest
                      </DropdownMenuItem>
                      {canModify && (
                        <DropdownMenuItem onClick={() => handleUploadNew(document.id)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Version
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {getDocumentTypeLabel(document.type)}
                    </Badge>
                    <Badge className={getAccessLevelColor(document.accessLevel)}>
                      {document.accessLevel.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Version {document.currentVersion}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated {document.updatedAt.toLocaleDateString()}
                  </div>
                </div>
                {document.tags && (
                  <div className="flex gap-1 mt-2">
                    {JSON.parse(document.tags).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <CreateDocumentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onSuccess={async () => {
          // Refresh documents list
          const result = await getProjectDocumentsAction(projectId);
          if (result.success) {
            setDocuments(result.data);
          }
        }}
      />

      <UploadDocumentDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        documentId={selectedDocumentId}
        onSuccess={async () => {
          // Refresh documents list
          const result = await getProjectDocumentsAction(projectId);
          if (result.success) {
            setDocuments(result.data);
          }
          setSelectedDocumentId(null);
        }}
      />

      <DocumentVersionsDialog
        open={isVersionsDialogOpen}
        onOpenChange={setIsVersionsDialogOpen}
        document={selectedDocumentForVersions}
        onUploadNewVersion={(documentId) => {
          setIsVersionsDialogOpen(false);
          handleUploadNew(documentId);
        }}
        onDownloadVersion={handleDownloadVersion}
        onPreviewVersion={handlePreviewVersion}
      />

      <DocumentPreviewDialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        documentId={selectedDocumentForPreview?.id || null}
        version={selectedDocumentForPreview?.version}
        fileName={selectedDocumentForPreview?.fileName}
        mimeType={selectedDocumentForPreview?.mimeType}
        onDownload={() => {
          if (selectedDocumentForPreview) {
            handleDownloadVersion(
              selectedDocumentForPreview.id, 
              selectedDocumentForPreview.version || "1"
            );
          }
        }}
      />
    </div>
  );
}