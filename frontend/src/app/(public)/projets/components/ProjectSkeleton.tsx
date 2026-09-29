// app/(public)/projets/components/ProjectSkeleton.tsx
'use client';

export function ProjectSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
        <div className="h-9 w-28 bg-muted rounded" />
      </div>
    </div>
  );
}