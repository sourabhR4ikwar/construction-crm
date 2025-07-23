import { Suspense } from "react";
import { ProjectDocumentsTab } from "./project-documents-tab";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDocumentsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Project Documents</h2>
        <p className="text-muted-foreground">
          Manage documents, drawings, contracts, and files for this project.
        </p>
      </div>

      <Suspense fallback={<ProjectDocumentsSkeleton />}>
        <ProjectDocumentsTab projectId={params.id} />
      </Suspense>
    </div>
  );
}

function ProjectDocumentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}