'use client';

import { motion } from 'framer-motion';
import { buildImageUrl } from '@/lib/imageUtils';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  Briefcase,
  UserCog,
  User,
  GraduationCap,
  Wrench,
  Megaphone,
  Handshake,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────
interface OrganigrammeNode {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  members?: { name: string; role?: string; avatar?: string }[];
  children?: OrganigrammeNode[];
}

interface OrganigrammeSectionProps {
  data?: OrganigrammeNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

// ─── Données par défaut (structure allégée pour l’exemple) ──
const defaultData: OrganigrammeNode = {
  id: 'ag',
  name: 'Assemblée Générale',
  role: 'Organe suprême',
  members: [
    { name: 'Jean Rakoto', role: 'Président' },
    { name: 'Marie Claire', role: 'Vice-Présidente' },
  ],
  children: [
    {
      id: 'ca',
      name: 'Conseil d\'Administration',
      role: 'Élu par l\'AG',
      members: [
        { name: 'Jean Rakoto', role: 'Président' },
        { name: 'Marie Claire', role: 'Vice-Présidente' },
        { name: 'Rivo Andriamanantena', role: 'Membre' },
        { name: 'Sarah Raza', role: 'Membre' },
      ],
      children: [
        {
          id: 'de',
          name: 'Direction Exécutive',
          role: 'Nommée par le CA',
          members: [
            { name: 'David Andriamahazo', role: 'DG' },
            { name: 'Hanta Razafindrakoto', role: 'Directrice Opérations' },
          ],
          children: [
            {
              id: 'dept-formations',
              name: 'Formations',
              role: 'Responsable : Sarah Raza',
              members: [
                { name: 'Sarah Raza', role: 'Responsable' },
                { name: 'Lala Randria', role: 'Formatrice' },
              ],
            },
            {
              id: 'dept-technique',
              name: 'Technique',
              role: 'Responsable : Rivo A.',
              members: [
                { name: 'Rivo Andriamanantena', role: 'Responsable' },
                { name: 'Tina Ravelo', role: 'Développeuse' },
              ],
            },
            {
              id: 'dept-communication',
              name: 'Communication',
              role: 'Responsable : Hanta R.',
              members: [
                { name: 'Hanta Razafindrakoto', role: 'Responsable' },
                { name: 'Aina Ravelonirina', role: 'Community Manager' },
              ],
            },
            {
              id: 'dept-rh',
              name: 'RH',
              role: 'Responsable : Marie C.',
              members: [
                { name: 'Marie Claire', role: 'Responsable RH' },
                { name: 'Tahina Rakoto', role: 'Chargé RH' },
              ],
            },
            {
              id: 'dept-finances',
              name: 'Finances',
              role: 'Responsable : Jean R.',
              members: [
                { name: 'Jean Rakoto', role: 'Responsable Finances' },
                { name: 'Faly Ranaivo', role: 'Comptable' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Couleurs par niveau ──────────────────────────────────
const levelColors = {
  root: { border: 'border-primary/40', bg: 'bg-primary/5', icon: 'text-primary' },
  ca: { border: 'border-amber-400/40', bg: 'bg-amber-50 dark:bg-amber-950/20', icon: 'text-amber-600' },
  de: { border: 'border-emerald-400/40', bg: 'bg-emerald-50 dark:bg-emerald-950/20', icon: 'text-emerald-600' },
  dept: { border: 'border-secondary/20', bg: 'bg-muted/30', icon: 'text-secondary' },
  default: { border: 'border-border/50', bg: 'bg-background/50', icon: 'text-muted-foreground' },
};

const getLevel = (node: OrganigrammeNode, depth: number): 'root' | 'ca' | 'de' | 'dept' | 'default' => {
  if (depth === 0) return 'root';
  if (node.id === 'ca') return 'ca';
  if (node.id === 'de') return 'de';
  if (node.id.startsWith('dept-')) return 'dept';
  return 'default';
};

const getIcon = (node: OrganigrammeNode, depth: number) => {
  const level = getLevel(node, depth);
  switch (level) {
    case 'root': return Users;
    case 'ca': return Building2;
    case 'de': return UserCog;
    case 'dept': return Briefcase;
    default: return User;
  }
};

// ─── Composant principal ──────────────────────────────────
export function OrganigrammeSection({
  data = defaultData,
  title = 'Organigramme',
  subtitle = 'Structure organisationnelle de Youth Computing',
  loading = false,
}: OrganigrammeSectionProps) {
  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <div className="h-10 w-48 animate-pulse rounded bg-muted mx-auto" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/30" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-ubuntu text-3xl font-bold md:text-4xl">
            {title} <span className="text-secondary">Youth Computing</span>
          </h2>
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-24 bg-secondary rounded-full" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm">{subtitle}</p>
        </motion.div>

        {/* Arbre */}
        <div className="flex flex-col items-center">
          <OrganigrammeNodeRenderer node={data} depth={0} />
        </div>
      </div>
    </section>
  );
}

// ─── Rendu récursif des nœuds ────────────────────────────
function OrganigrammeNodeRenderer({
  node,
  depth,
}: {
  node: OrganigrammeNode;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const toggleExpand = () => setExpanded(!expanded);

  const level = getLevel(node, depth);
  const colors = levelColors[level];
  const Icon = getIcon(node, depth);

  const hasChildren = node.children && node.children.length > 0;
  const hasMembers = node.members && node.members.length > 0;
  const isExpandable = hasChildren || hasMembers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.05 }}
      viewport={{ once: true }}
      className="w-full"
    >
      {/* Carte du nœud */}
      <Card
        className={cn(
          'w-full border-2 shadow-md hover:shadow-lg transition-all duration-300',
          colors.border,
          colors.bg
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colors.bg)}>
                <Icon className={cn('h-5 w-5', colors.icon)} />
              </div>
              <div className="min-w-0">
                <h3 className="font-ubuntu text-base font-semibold truncate">{node.name}</h3>
                {node.role && (
                  <p className="text-xs text-muted-foreground truncate">{node.role}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {node.members && (
                <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-background/50">
                  {node.members.length} membre{node.members.length > 1 ? 's' : ''}
                </Badge>
              )}
              {isExpandable && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleExpand}>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Membres (si étendu) */}
          {expanded && hasMembers && (
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {node.members!.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-2 rounded-md bg-background/60 px-2.5 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar ? buildImageUrl(member.avatar, false) : undefined} alt={member.name} />
                    <AvatarFallback className="bg-secondary/10 text-secondary text-[10px] font-bold">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    {member.role && (
                      <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connexion verticale et enfants */}
      {expanded && hasChildren && (
        <>
          <div className="relative flex justify-center h-6">
            <div className="w-0.5 h-full bg-gradient-to-b from-primary/30 to-secondary/30" />
            <div className="absolute bottom-0 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-secondary/40 bg-background" />
          </div>

          <div className="w-full">
            {node.children!.length === 1 ? (
              <div className="flex justify-center">
                <div className="w-full max-w-3xl">
                  <OrganigrammeNodeRenderer node={node.children![0]} depth={depth + 1} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {node.children!.map((child) => (
                  <OrganigrammeNodeRenderer key={child.id} node={child} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}