import { usePermissions } from "@/hooks/use-permissions";

interface DocumentPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  role: string | null;
}

export function useDocumentPermissions() {
  const { canRead, canWrite, canDelete, role } = usePermissions();
  
  const permissions: DocumentPermissions = {
    canRead,
    canWrite,
    canDelete,
    role,
  };

  return { permissions, isLoading: false };
}

export function canAccessDocument(
  documentAccessLevel: string,
  userRole: string | null
): boolean {
  if (!userRole) return false;

  switch (documentAccessLevel) {
    case "public":
      return true;
    case "project_members":
      return ["admin", "staff", "readonly"].includes(userRole);
    case "admin_only":
      return userRole === "admin";
    default:
      return false;
  }
}

export function canModifyDocument(
  documentAccessLevel: string,
  userRole: string | null,
  _createdBy?: string,
  _currentUserId?: string
): boolean {
  if (!userRole) return false;

  // Admin can always modify
  if (userRole === "admin") return true;

  // Staff can modify project_members and public documents
  if (userRole === "staff") {
    return ["public", "project_members"].includes(documentAccessLevel);
  }

  // Readonly users cannot modify anything
  return false;
}