import { CandidatureRepository } from '../repositories/candidature.repository';
import { InterviewRepository } from '../repositories/interview.repository';
import { EvaluationRepository } from '../repositories/evaluation.repository';
import {
  CreateCandidatureDTO,
  UpdateCandidatureDTO,
  CreateEvaluationDTO,
} from '../types/dto/candidature.dto';
import { ApiError } from '../utils/ApiError';
import { Candidature } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import prisma from '../../prisma/client'; // ✅ Import du client Prisma

export class CandidatureService {
  private candidatureRepository: CandidatureRepository;
  private interviewRepository: InterviewRepository;
  private evaluationRepository: EvaluationRepository;

  constructor() {
    this.candidatureRepository = new CandidatureRepository();
    this.interviewRepository = new InterviewRepository();
    this.evaluationRepository = new EvaluationRepository();
  }

  // ─── CRUD CANDIDATURE ──────────────────────────────────

  async findAll(pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.candidatureRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { Recruitment: { select: { title: true, position: true } } },
      }),
      this.candidatureRepository.count(),
    ]);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Candidature> {
    return this.candidatureRepository.findByIdOrThrow(id);
  }

  async create(data: CreateCandidatureDTO): Promise<Candidature> {
    const candidature = await this.candidatureRepository.create({
      ...data,
      Recruitment: { connect: { id: data.recruitmentId } },
    });

    try {
      await mailer.sendTemplatedEmail(
        data.email,
        'candidature-received',
        {
          name: data.fullName,
          content: `
            <h2>Confirmation de réception</h2>
            <p>Votre candidature a bien été enregistrée.</p>
            <p>Nous vous contacterons prochainement pour la suite du processus.</p>
          `,
        }
      );
    } catch (error) {
      logger.error('Erreur envoi email confirmation candidature :', error);
    }

    return candidature;
  }

  async update(id: string, data: UpdateCandidatureDTO): Promise<Candidature> {
    await this.candidatureRepository.findByIdOrThrow(id);
    return this.candidatureRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.candidatureRepository.delete(id);
  }

  async getByRecruitment(recruitmentId: string): Promise<Candidature[]> {
    return this.candidatureRepository.findMany({
      where: { recruitmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByEmail(email: string): Promise<Candidature[]> {
    return this.candidatureRepository.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string): Promise<Candidature> {
    await this.candidatureRepository.findByIdOrThrow(id);
    return this.candidatureRepository.update(id, { status });
  }

  // ─── INTERVIEWS ──────────────────────────────────────

  async scheduleInterview(candidatureId: string, data: any): Promise<any> {
    const candidature = await this.candidatureRepository.findByIdOrThrow(candidatureId);
    const interview = await this.interviewRepository.create({
      ...data,
      Candidature: { connect: { id: candidatureId } },
    });

    try {
      await mailer.sendTemplatedEmail(
        candidature.email,
        'interview-scheduled',
        {
          name: candidature.fullName,
          content: `
            <h2>Entretien planifié</h2>
            <p>Un entretien a été planifié pour votre candidature.</p>
            <p><strong>Date :</strong> ${new Date(data.scheduledAt).toLocaleString('fr-FR')}</p>
            <p><strong>Intervieweur :</strong> ${data.interviewer || 'Non spécifié'}</p>
            ${data.notes ? `<p><strong>Notes :</strong> ${data.notes}</p>` : ''}
            <p>Merci de confirmer votre disponibilité.</p>
          `,
        }
      );
    } catch (error) {
      logger.error('Erreur envoi email planification entretien :', error);
    }

    return interview;
  }

  async updateInterview(id: string, data: any): Promise<any> {
    return this.interviewRepository.update(id, data);
  }

  async deleteInterview(id: string): Promise<void> {
    await this.interviewRepository.delete(id);
  }

  async getInterviews(candidatureId: string): Promise<any[]> {
    return this.interviewRepository.findMany({
      where: { candidatureId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // ─── EVALUATIONS ─────────────────────────────────────

  async addEvaluation(
    candidatureId: string,
    data: Omit<CreateEvaluationDTO, 'candidatureId' | 'evaluatorId'>,
    evaluatorId: string
  ): Promise<any> {
    const candidature = await this.candidatureRepository.findByIdOrThrow(candidatureId);
    const evaluation = await this.evaluationRepository.create({
      criteria: data.criteria,
      score: data.score,
      comments: data.comments,
      Candidature: { connect: { id: candidatureId } },
      User: { connect: { id: evaluatorId } },
    });

    try {
      await mailer.sendTemplatedEmail(
        candidature.email,
        'evaluation-added',
        {
          name: candidature.fullName,
          content: `
            <h2>Nouvelle évaluation</h2>
            <p>Une évaluation a été ajoutée à votre candidature.</p>
            <p><strong>Critère :</strong> ${data.criteria}</p>
            <p><strong>Score :</strong> ${data.score}/10</p>
            ${data.comments ? `<p><strong>Commentaire :</strong> ${data.comments}</p>` : ''}
            <p>Nous vous remercions de votre participation.</p>
          `,
        }
      );
    } catch (error) {
      logger.error('Erreur envoi email évaluation :', error);
    }

    return evaluation;
  }

  async updateEvaluation(id: string, data: any): Promise<any> {
    return this.evaluationRepository.update(id, data);
  }

  async deleteEvaluation(id: string): Promise<void> {
    await this.evaluationRepository.delete(id);
  }

  async getEvaluations(candidatureId: string): Promise<any[]> {
    return this.evaluationRepository.findMany({
      where: { candidatureId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageScore(candidatureId: string): Promise<number | null> {
    const evaluations = await this.evaluationRepository.findMany({
      where: { candidatureId },
      select: { score: true },
    });
    if (evaluations.length === 0) return null;
    const sum = evaluations.reduce((acc, e) => acc + e.score, 0);
    return sum / evaluations.length;
  }

  // ─── ENVOI DU RAPPORT D'ÉVALUATION PAR EMAIL ──────────

  /**
   * ✅ Version corrigée utilisant le client Prisma directement
   * pour inclure les relations Evaluation et Recruitment
   */
  async sendEvaluationReport(candidatureId: string): Promise<void> {
    // 🔍 Récupérer la candidature avec les relations incluses
    const candidature = await prisma.candidature.findUnique({
      where: { id: candidatureId },
      include: {
        Evaluation: true,
        Recruitment: { select: { position: true } },
      },
    });

    if (!candidature) {
      throw ApiError.notFound('Candidature non trouvée');
    }

    if (!candidature.Evaluation || candidature.Evaluation.length === 0) {
      throw ApiError.badRequest('Aucune évaluation à envoyer');
    }

    const avgScore =
      candidature.Evaluation.reduce((sum, e) => sum + e.score, 0) / candidature.Evaluation.length;

    const evaluationRows = candidature.Evaluation.map(
      (e) =>
        `<li><strong>${e.criteria}</strong> : ${e.score}/10${e.comments ? ` – ${e.comments}` : ''}</li>`
    ).join('');

    await mailer.sendTemplatedEmail(
      candidature.email,
      'evaluation-report',
      {
        name: candidature.fullName,
        content: `
          <h2>Rapport d’évaluation</h2>
          <p>Voici le récapitulatif des évaluations pour votre candidature au poste de <strong>${candidature.Recruitment?.position || ''}</strong>.</p>
          <ul>${evaluationRows}</ul>
          <p><strong>Score moyen :</strong> ${avgScore.toFixed(1)}/10</p>
          <p>L’équipe Youth Computing vous remercie de votre participation.</p>
        `,
      }
    );
  }

  // ─── STATISTIQUES ─────────────────────────────────────

  async getStats() {
    const total = await this.candidatureRepository.count();
    const byStatus = await this.candidatureRepository.groupBy('status');
    return { total, byStatus };
  }

  toDTO(candidature: Candidature): any {
    return {
      id: candidature.id,
      fullName: candidature.fullName,
      email: candidature.email,
      phone: candidature.phone,
      cvUrl: candidature.cvUrl,
      coverLetter: candidature.coverLetter,
      status: candidature.status,
      notes: candidature.notes,
      recruitmentId: candidature.recruitmentId,
      createdAt: candidature.createdAt,
      updatedAt: candidature.updatedAt,
    };
  }
}