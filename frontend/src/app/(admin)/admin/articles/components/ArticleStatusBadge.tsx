'use client';

import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-500',
  PUBLISHED: 'bg-green-500/10 text-green-500',
  ARCHIVED: 'bg-red-500/10 text-red-500',
  SCHEDULED: 'bg-blue-500/10 text-blue-500',
};

export function ArticleStatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColors[status] || ''}>
      {status}
    </Badge>
  );
}