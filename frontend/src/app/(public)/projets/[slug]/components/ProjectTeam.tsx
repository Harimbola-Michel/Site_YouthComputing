// app/(public)/projets/[slug]/components/ProjectTeam.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMember } from '@/types';
import { buildImageUrl } from '@/lib/imageUtils';

interface ProjectTeamProps {
  team: TeamMember[];
}

export function ProjectTeam({ team }: ProjectTeamProps) {
  if (!team || team.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {team.map((member, index) => {
        const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`;
        return (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <Avatar className="mx-auto h-16 w-16">
                <AvatarImage src={member.avatar ? buildImageUrl(member.avatar, false) : undefined} alt={`${member.firstName} ${member.lastName}`} />
                <AvatarFallback className="bg-secondary/10 text-secondary">
                  {initials || '?'}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-medium">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}