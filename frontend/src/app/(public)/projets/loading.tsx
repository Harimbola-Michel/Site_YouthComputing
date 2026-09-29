// app/(public)/projets/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 text-center">
        <div className="h-12 w-48 animate-pulse rounded bg-muted mx-auto" />
        <div className="mt-4 h-6 w-80 animate-pulse rounded bg-muted mx-auto" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}