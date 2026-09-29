// src/app/(admin)/admin/dashboard/components/ChartsSection.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  GraduationCap,
  UsersRound,
  BarChart3,
  Award,
  Users,
  Target,
  Percent,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export interface ChartData {
  month: string;
  inscriptions: number;
  formations: number;
  y2c: number;
}

export interface RoleData {
  name: string;
  value: number;
}

export interface ChartsSectionProps {
  stats?: {
    chartData?: ChartData[];
    roleData?: RoleData[];
  };
  loading?: boolean;
}

// ============================================================
// PALETTE PROFESSIONNELLE (charte Y2C)
// ============================================================
const ROLE_COLORS = [
  '#010B40', // Bleu nuit principal
  '#F13544', // Rouge secondaire
  '#0ea5e9', // Cyan
  '#10b981', // Émeraude
  '#f59e0b', // Ambre
  '#8b5cf6', // Violet
  '#6b7280', // Gris
  '#ec4899', // Rose
];

// Noms français des rôles
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  EDITOR: 'Éditeur',
  CONTRIBUTOR: 'Contributeur',
  MEMBER: 'Membre',
  VIEWER: 'Lecteur',
  USER: 'Utilisateur',
};

// ============================================================
// HELPER — Toujours un tableau
// ============================================================
function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const obj = value as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

// ============================================================
// TOOLTIP PREMIUM
// ============================================================
const PremiumTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border/60 bg-background/95 p-3 shadow-2xl backdrop-blur-md"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="capitalize text-muted-foreground">
              {entry.name}
            </span>
            <span className="ml-auto font-bold tabular-nums text-foreground">
              {Number(entry.value).toLocaleString('fr-FR')}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================
// RENDU LABEL PIE — Avec lignes de connexion
// ============================================================
const RADIAN = Math.PI / 180;

function renderPieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
  index,
}: any) {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 24) * cos;
  const my = cy + (outerRadius + 24) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  // Ne pas afficher si trop petit (< 3%)
  if (percent < 0.03) return null;

  const color = ROLE_COLORS[index % ROLE_COLORS.length];
  const roleLabel = ROLE_LABELS[name] || name;

  return (
    <g>
      {/* Ligne extérieure */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Point de connexion */}
      <circle cx={sx} cy={sy} r={2.5} fill={color} />
      {/* Texte nom du rôle */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        textAnchor={textAnchor}
        fill="hsl(var(--foreground))"
        fontSize={11}
        fontWeight={700}
      >
        {roleLabel}
      </text>
      {/* Texte pourcentage */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey + 14}
        textAnchor={textAnchor}
        fill="hsl(var(--muted-foreground))"
        fontSize={10}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}% · ${value}`}
      </text>
    </g>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export function ChartsSection({ stats, loading }: ChartsSectionProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // ✅ Toujours des tableaux
  const chartData = useMemo(() => asArray<ChartData>(stats?.chartData), [stats]);
  const roleData = useMemo(() => asArray<RoleData>(stats?.roleData), [stats]);

  const hasChartData = chartData.length > 0;
  const hasRoleData = roleData.length > 0;

  // ─── Filtre période ───
  const filteredChartData = useMemo(() => {
    const limit = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return chartData.slice(-Math.min(limit, chartData.length));
  }, [chartData, period]);

  // ─── Total utilisateurs ───
  const totalUsers = useMemo(
    () => roleData.reduce((s, d) => s + (d.value || 0), 0),
    [roleData]
  );

  // ─── Stats calculées ───
  const statsCalc = useMemo(() => {
    const data = filteredChartData;
    if (!data.length) {
      return {
        inscriptions: { avg: 0, total: 0, last: 0, max: 0 },
        formations: { avg: 0, total: 0, last: 0, max: 0 },
        y2c: { avg: 0, total: 0, last: 0, max: 0 },
      };
    }

    const calc = (key: keyof Omit<ChartData, 'month'>) => {
      const values = data.map((d) => Number(d[key]) || 0);
      const total = values.reduce((s, v) => s + v, 0);
      return {
        avg: total / values.length,
        total,
        last: values[values.length - 1] || 0,
        max: Math.max(...values),
      };
    };

    return {
      inscriptions: calc('inscriptions'),
      formations: calc('formations'),
      y2c: calc('y2c'),
    };
  }, [filteredChartData]);

  // ─── Loading ───
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <Skeleton className="h-[460px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* ═══════════════ GRAPHIQUES ═══════════════ */}
      <Tabs defaultValue="formations" className="w-full">
        {/* ─── En-tête des tabs ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-xl border border-border/50 bg-muted/50 p-1">
            <TabsTrigger
              value="formations"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Formations
            </TabsTrigger>
            <TabsTrigger
              value="inscriptions"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Inscriptions
            </TabsTrigger>
            <TabsTrigger
              value="y2c"
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:shadow-sm"
            >
              <UsersRound className="h-3.5 w-3.5" />
              Communauté Y2C
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/40 p-1">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  period === p
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                )}
                aria-pressed={period === p}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {!hasChartData ? (
          <EmptyState
            title="Aucune donnée de graphique disponible"
            subtitle="Les données seront affichées ici une fois disponibles"
          />
        ) : (
          <>
            {/* ═══════════════════════════════════════════ */}
            {/* FORMATIONS — Graphique premium              */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="formations" className="mt-4">
              <ChartCard
                title="Formations par mois"
                subtitle="Nombre de formations créées sur la période"
                icon={<GraduationCap className="h-4 w-4" />}
                metrics={[
                  { label: 'Total', value: statsCalc.formations.total },
                  {
                    label: 'Moyenne',
                    value: statsCalc.formations.avg.toFixed(1),
                  },
                  {
                    label: 'Dernier',
                    value: statsCalc.formations.last,
                    highlight: true,
                  },
                ]}
                accent="secondary"
                footer={
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="h-3 w-3 text-secondary" />
                    <span>
                      Pic à{' '}
                      <span className="font-semibold text-foreground">
                        {statsCalc.formations.max}
                      </span>{' '}
                      formations sur un mois
                    </span>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradFormations"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#F13544" stopOpacity={1} />
                        <stop
                          offset="50%"
                          stopColor="#F13544"
                          stopOpacity={0.85}
                        />
                        <stop
                          offset="100%"
                          stopColor="#F13544"
                          stopOpacity={0.5}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradFormationsHighlight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#010B40" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#1a2b5c"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                        fontWeight: 500,
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        fill: '#F13544',
                        fillOpacity: 0.06,
                        radius: 8,
                      }}
                    />

                    <Bar
                      dataKey="formations"
                      name="Formations"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                      animationDuration={800}
                    >
                      {filteredChartData.map((entry, index) => {
                        const isMax =
                          entry.formations === statsCalc.formations.max;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              isMax
                                ? 'url(#gradFormationsHighlight)'
                                : 'url(#gradFormations)'
                            }
                          />
                        );
                      })}
                      <LabelList
                        dataKey="formations"
                        position="top"
                        offset={8}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fill: 'hsl(var(--foreground))',
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ═══════════════════════════════════════════ */}
            {/* INSCRIPTIONS                                */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="inscriptions" className="mt-4">
              <ChartCard
                title="Évolution des inscriptions"
                subtitle="Nombre d'inscriptions par mois"
                icon={<TrendingUp className="h-4 w-4" />}
                metrics={[
                  { label: 'Total', value: statsCalc.inscriptions.total },
                  {
                    label: 'Moyenne',
                    value: statsCalc.inscriptions.avg.toFixed(1),
                  },
                  {
                    label: 'Dernier',
                    value: statsCalc.inscriptions.last,
                    highlight: true,
                  },
                ]}
                accent="primary"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradInscriptions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#010B40"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="#010B40"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.2,
                        strokeDasharray: '4 4',
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="inscriptions"
                      name="Inscriptions"
                      stroke="#010B40"
                      strokeWidth={3}
                      fill="url(#gradInscriptions)"
                      activeDot={{
                        r: 7,
                        strokeWidth: 3,
                        stroke: '#fff',
                        fill: '#010B40',
                      }}
                      animationDuration={800}
                    >
                      <LabelList
                        dataKey="inscriptions"
                        position="top"
                        offset={10}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fill: 'hsl(var(--foreground))',
                        }}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>

            {/* ═══════════════════════════════════════════ */}
            {/* Y2C                                         */}
            {/* ═══════════════════════════════════════════ */}
            <TabsContent value="y2c" className="mt-4">
              <ChartCard
                title="Évolution des membres Y2C"
                subtitle="Croissance de la communauté"
                icon={<UsersRound className="h-4 w-4" />}
                metrics={[
                  { label: 'Total', value: statsCalc.y2c.total },
                  { label: 'Moyenne', value: statsCalc.y2c.avg.toFixed(1) },
                  {
                    label: 'Dernier',
                    value: statsCalc.y2c.last,
                    highlight: true,
                  },
                ]}
                accent="primary"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredChartData}
                    margin={{ top: 30, right: 15, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      vertical={false}
                      opacity={0.6}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={<PremiumTooltip />}
                      cursor={{
                        stroke: '#010B40',
                        strokeOpacity: 0.2,
                        strokeDasharray: '4 4',
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="y2c"
                      name="Membres Y2C"
                      stroke="#010B40"
                      strokeWidth={3}
                      dot={{
                        fill: '#010B40',
                        r: 5,
                        strokeWidth: 3,
                        stroke: '#fff',
                      }}
                      activeDot={{
                        r: 8,
                        strokeWidth: 3,
                        stroke: '#fff',
                        fill: '#F13544',
                      }}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* ═══════════════ RÉPARTITION DES RÔLES ═══════════════ */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        {/* ─── Header ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Répartition des rôles
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribution des utilisateurs par type de compte
              </p>
            </div>
          </div>
          {hasRoleData && (
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-bold tabular-nums text-primary">
                {totalUsers.toLocaleString('fr-FR')}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-primary/80">
                utilisateur{totalUsers > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ─── Body ─── */}
        <div className="p-5">
          {!hasRoleData ? (
            <EmptyState
              title="Aucune donnée de répartition"
              subtitle="Les données apparaîtront ici"
              compact
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              {/* ─── Graphique Donut ─── */}
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {ROLE_COLORS.map((color, i) => (
                        <radialGradient
                          key={i}
                          id={`roleGradient-${i}`}
                          cx="50%"
                          cy="50%"
                          r="50%"
                        >
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop
                            offset="100%"
                            stopColor={color}
                            stopOpacity={0.75}
                          />
                        </radialGradient>
                      ))}
                    </defs>

                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="hsl(var(--background))"
                      strokeWidth={3}
                      animationDuration={800}
                    >
                      {roleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#roleGradient-${index % ROLE_COLORS.length})`}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<PremiumTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* ─── Légende Détaillée ─── */}
              <div className="flex flex-col justify-center space-y-2">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Percent className="h-3 w-3" />
                  <span>Détail par rôle</span>
                </div>

                {roleData.map((role, index) => {
                  const percent =
                    totalUsers > 0 ? (role.value / totalUsers) * 100 : 0;
                  const color = ROLE_COLORS[index % ROLE_COLORS.length];
                  const label = ROLE_LABELS[role.name] || role.name;

                  return (
                    <motion.div
                      key={role.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-center gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-border/60 hover:bg-muted/40"
                    >
                      {/* Point coloré */}
                      <span
                        className="h-3 w-3 shrink-0 rounded-full ring-2 ring-background transition-transform group-hover:scale-125"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}60`,
                        }}
                      />

                      {/* Nom */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {label}
                        </p>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/60">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>

                      {/* Valeur */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {role.value}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground tabular-nums">
                          {percent.toFixed(0)}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Total */}
                <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                  <span className="text-sm font-bold tabular-nums text-primary">
                    {totalUsers.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// SOUS-COMPOSANTS
// ============================================================
interface MetricDisplay {
  label: string;
  value: number | string;
  highlight?: boolean;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  metrics?: MetricDisplay[];
  accent?: 'primary' | 'secondary' | 'success';
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const ACCENT_MAP = {
  primary: {
    iconBg: 'bg-primary/10 text-primary',
    highlight: 'text-primary',
  },
  secondary: {
    iconBg: 'bg-secondary/10 text-secondary',
    highlight: 'text-secondary',
  },
  success: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    highlight: 'text-emerald-600 dark:text-emerald-400',
  },
};

function ChartCard({
  title,
  subtitle,
  icon,
  metrics,
  accent = 'primary',
  footer,
  children,
}: ChartCardProps) {
  const styles = ACCENT_MAP[accent];

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                styles.iconBg
              )}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">{title}</h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Métriques inline */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              {metrics.map((metric, idx) => (
                <div key={metric.label} className="flex items-center gap-3">
                  {idx > 0 && (
                    <div className="h-8 w-px bg-border/60" aria-hidden="true" />
                  )}
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </p>
                    <p
                      className={cn(
                        'font-bold tabular-nums',
                        metric.highlight
                          ? styles.highlight
                          : 'text-foreground'
                      )}
                    >
                      {typeof metric.value === 'number'
                        ? metric.value.toLocaleString('fr-FR')
                        : metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone graphique */}
      <div className="h-[380px] w-full p-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border/40 bg-muted/20 px-5 py-2.5">
          {footer}
        </div>
      )}
    </Card>
  );
}

function EmptyState({
  title,
  subtitle,
  compact,
}: {
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20',
        compact ? 'h-56' : 'h-72'
      )}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
          <BarChart3 className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{subtitle}</p>
      </div>
    </div>
  );
}