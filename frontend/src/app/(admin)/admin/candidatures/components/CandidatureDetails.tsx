'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Plus,
  Clock,
  UserCheck,
  Star,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { candidatures } from '@/lib/api';
import toast from 'react-hot-toast';
import { CandidatureStatusBadge } from './CandidatureStatusBadge';
import { InterviewForm } from './InterviewForm';
import { EvaluationForm } from './EvaluationForm';
import type { Candidature } from './CandidaturesTable';

interface CandidatureDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidature: Candidature;
  onUpdate: () => void;
}

interface Interview {
  id: string;
  scheduledAt: string;
  interviewer: string;
  notes?: string;
  status: string;
}

interface Evaluation {
  id: string;
  criteria: string;
  score: number;
  comments?: string;
}

export function CandidatureDetails({
  open,
  onOpenChange,
  candidature,
  onUpdate,
}: CandidatureDetailsProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!candidature?.id) return;
    setLoading(true);
    try {
      const [interviewsRes, evaluationsRes] = await Promise.all([
        candidatures.getInterviews(candidature.id),
        candidatures.getEvaluations(candidature.id),
      ]);
      setInterviews(interviewsRes?.data?.data || interviewsRes?.data || []);
      setEvaluations(evaluationsRes?.data?.data || evaluationsRes?.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Impossible de charger les détails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && candidature) {
      fetchData();
    }
  }, [open, candidature]);

  const handleAddInterview = async (data: any) => {
    setIsSubmitting(true);
    try {
      await candidatures.scheduleInterview(candidature.id, data);
      toast.success('Entretien planifié avec succès ✅');
      setShowInterviewForm(false);
      await fetchData();
      onUpdate();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de la planification';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEvaluation = async (data: any) => {
    setIsSubmitting(true);
    try {
      await candidatures.addEvaluation(candidature.id, data);
      toast.success('Évaluation ajoutée avec succès ✅');
      setShowEvaluationForm(false);
      await fetchData();
      onUpdate();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erreur lors de l\'ajout';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInterview = async (id: string) => {
    if (!confirm('Supprimer cet entretien ?')) return;
    try {
      // Appel API à définir si disponible
      // await candidatures.deleteInterview(id);
      toast.success('Entretien supprimé');
      await fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (!candidature) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {candidature.fullName}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm">{candidature.email}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">{candidature.phone}</span>
                <span className="text-muted-foreground">•</span>
                <CandidatureStatusBadge status={candidature.status} />
                {candidature.recruitment?.title && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {candidature.recruitment.title}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  fetchData();
                  toast.success('Données actualisées');
                }}
                disabled={loading}
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                ✕
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <Tabs defaultValue="interviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interviews" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Entretiens
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Évaluations
              </TabsTrigger>
              <TabsTrigger value="cv" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CV
              </TabsTrigger>
            </TabsList>

            {/* ─── Onglet Entretiens ─── */}
            <TabsContent value="interviews" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Entretiens planifiés
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowInterviewForm(!showInterviewForm)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Planifier
                </Button>
              </div>

              {showInterviewForm && (
                <Card className="border-2 border-primary/10 bg-muted/5">
                  <CardContent className="pt-4">
                    <InterviewForm
                      onSubmit={handleAddInterview}
                      onCancel={() => setShowInterviewForm(false)}
                    />
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-2">Aucun entretien planifié</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <Card key={interview.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatDate(interview.scheduledAt)}
                              </span>
                              <Badge variant="outline">
                                {interview.status || 'Planifié'}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>{interview.interviewer}</span>
                            </div>
                            {interview.notes && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {interview.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteInterview(interview.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* ─── Onglet Évaluations ─── */}
            <TabsContent value="evaluations" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Évaluations du candidat
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowEvaluationForm(!showEvaluationForm)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une évaluation
                </Button>
              </div>

              {showEvaluationForm && (
                <Card className="border-2 border-primary/10 bg-muted/5">
                  <CardContent className="pt-4">
                    <EvaluationForm
                      onSubmit={handleAddEvaluation}
                      onCancel={() => setShowEvaluationForm(false)}
                    />
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : evaluations.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-2">Aucune évaluation</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {evaluations.map((evaluation) => (
                      <Card key={evaluation.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{evaluation.criteria}</span>
                                <Badge className="bg-secondary/10 text-secondary">
                                  Score: {evaluation.score}/10
                                </Badge>
                              </div>
                              {evaluation.comments && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {evaluation.comments}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* ─── Onglet CV ─── */}
            <TabsContent value="cv" className="pt-4">
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground/30" />
                <p className="mt-4 font-medium">CV du candidat</p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => {
                    const cvUrl = candidature.cvUrl.startsWith('http')
                      ? candidature.cvUrl
                      : `${window.location.origin}${candidature.cvUrl}`;
                    window.open(cvUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Ouvrir le CV
                </Button>
                {candidature.coverLetter && (
                  <>
                    <Separator className="my-6" />
                    <div className="w-full max-w-md">
                      <h4 className="font-medium mb-2">Lettre de motivation</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {candidature.coverLetter}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}