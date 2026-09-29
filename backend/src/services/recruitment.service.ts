// src/services/recruitment.service.ts

import { BaseService } from './base.service';
import { RecruitmentRepository } from '../repositories/recruitment.repository';
import { CandidatureRepository } from '../repositories/candidature.repository';
import { CreateRecruitmentDTO, UpdateRecruitmentDTO } from '../types/dto/recruitment.dto';
import { CreateCandidatureDTO } from '../types/dto/candidature.dto';
import { ApiError } from '../utils/ApiError';
import { Recruitment } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class RecruitmentService extends BaseService<Recruitment, CreateRecruitmentDTO, UpdateRecruitmentDTO> {
  private recruitmentRepository: RecruitmentRepository;
  private candidatureRepository: CandidatureRepository;

  constructor() {
    super(new RecruitmentRepository());
    this.recruitmentRepository = new RecruitmentRepository();
    this.candidatureRepository = new CandidatureRepository();
  }

  // ─── Layout HTML pour tous les emails ────────────────────────
  private getEmailLayout(content: string, title: string): string {
    const siteName = 'Youth Computing';
    const siteUrl = env.FRONTEND_URL || 'https://youthcomputing.mg';
    const year = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7fc;
            padding: 20px;
            line-height: 1.6;
            color: #1e293b;
          }
          .container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #0b1a4a, #1a3a8a);
            padding: 32px 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .header h1 span { color: #ffd700; }
          .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            margin: 8px 0 0;
          }
          .body { padding: 32px 28px; }
          .body h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0b1a4a;
            margin-bottom: 16px;
          }
          .body p { margin-bottom: 12px; }
          .body .button {
            display: inline-block;
            padding: 10px 24px;
            background: #1a3a8a;
            color: #ffffff !important;
            border-radius: 40px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
          }
          .body .button:hover { background: #0b1a4a; }
          .body .info-box {
            background: #f1f5f9;
            border-radius: 10px;
            padding: 16px 20px;
            margin: 16px 0;
            font-size: 14px;
          }
          .body .info-box strong { color: #0b1a4a; }
          .footer {
            padding: 20px 28px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            background: #fafbfc;
          }
          .footer a { color: #1a3a8a; text-decoration: none; }
          .footer a:hover { text-decoration: underline; }
          .footer .social {
            margin-top: 8px;
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          .footer .social a {
            color: #94a3b8;
            font-size: 18px;
            text-decoration: none;
          }
          .footer .social a:hover { color: #1a3a8a; }
          @media (max-width: 480px) {
            .body { padding: 20px; }
            .body .button { width: 100%; text-align: center; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💼 <span>Youth</span> Computing</h1>
            <p>${title}</p>
          </div>
          <div class="body">
            ${content}
          </div>
          <div class="footer">
            <p>
              Cet email a été envoyé par <strong>Youth Computing</strong>.<br />
              <a href="${siteUrl}">${siteUrl}</a>
            </p>
            <div class="social">
              <a href="https://facebook.com/youthcomputing" target="_blank">📘</a>
              <a href="https://twitter.com/youthcomputing" target="_blank">🐦</a>
              <a href="https://linkedin.com/company/youthcomputing" target="_blank">💼</a>
            </div>
            <p style="margin-top:10px; font-size:11px; color:#b0b8c4;">
              &copy; ${year} Youth Computing. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ─── Méthode utilitaire d’envoi d’email ─────────────────────
  private async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const html = this.getEmailLayout(content, subject);
    await mailer.sendTemplatedEmail(to, 'recruitment-notification', {
      subject,
      html,
      content,
    });
    logger.info(`📧 Email recrutement envoyé à ${to}: ${subject}`);
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateRecruitmentDTO): Promise<Recruitment> {
    const slug = await generateUniqueSlug(data.title, 'recruitment');
    return this.recruitmentRepository.create({
      ...data,
      slug,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateRecruitmentDTO): Promise<Recruitment> {
    const recruitment = await this.recruitmentRepository.findByIdOrThrow(id);
    let slug = recruitment.slug;
    if (data.title && data.title !== recruitment.title) {
      slug = await generateUniqueSlug(data.title, 'recruitment');
    }
    return this.recruitmentRepository.update(id, { ...data, slug });
  }

  // ─── AUTRES MÉTHODES ──────────────────────────────────────
  async getBySlug(slug: string): Promise<Recruitment | null> {
    return this.recruitmentRepository.findBySlug(slug);
  }

  async getActiveRecruitments(): Promise<Recruitment[]> {
    return this.recruitmentRepository.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<any> {
    const total = await this.recruitmentRepository.count();
    const active = await this.recruitmentRepository.count({ isActive: true });
    const closed = await this.recruitmentRepository.count({ isActive: false });
    const byDepartment = await this.recruitmentRepository.groupBy('department');
    const totalCandidatures = await this.candidatureRepository.count();
    return { total, active, closed, byDepartment, totalCandidatures };
  }

  // ─── CANDIDATURES ──────────────────────────────────────────

  async applyForPosition(data: CreateCandidatureDTO): Promise<any> {
    if (!data.cvUrl) {
      throw ApiError.badRequest('Le CV est requis');
    }

    const recruitment = await this.recruitmentRepository.findByIdOrThrow(data.recruitmentId);

    if (!recruitment.isActive) {
      throw ApiError.badRequest('Cette offre n\'est plus active');
    }

    // Vérifier les doublons
    const existingCandidatures = await this.candidatureRepository.findMany({
      where: {
        recruitmentId: data.recruitmentId,
        email: data.email,
      },
    });

    if (existingCandidatures.length > 0) {
      throw ApiError.conflict('Vous avez déjà postulé à cette offre');
    }

    // ✅ Création avec la relation Prisma via `connect`
    const candidature = await this.candidatureRepository.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      cvUrl: data.cvUrl,
      coverLetter: data.coverLetter,
      status: 'PENDING',
      Recruitment: {
        connect: { id: data.recruitmentId },
      },
    });

    // ─── Email de confirmation de candidature (designé) ──────
    try {
      const siteUrl = env.FRONTEND_URL || 'https://youthcomputing.mg';
      const formattedDeadline = recruitment.deadline
        ? new Date(recruitment.deadline).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'Non spécifiée';

      const content = `
        <h2>📩 Confirmation de candidature</h2>
        <p>Bonjour <strong>${data.fullName}</strong>,</p>
        <p>Nous avons bien reçu votre candidature pour le poste de <strong>« ${recruitment.position} »</strong> au sein de <strong>Youth Computing</strong>.</p>
        <div class="info-box">
          <p><strong>📌 Poste :</strong> ${recruitment.position}</p>
          <p><strong>🏢 Département :</strong> ${recruitment.department || 'Non spécifié'}</p>
          <p><strong>📅 Date limite :</strong> ${formattedDeadline}</p>
          <p><strong>🔖 Référence :</strong> ${candidature.id}</p>
        </div>
        <p>Notre équipe RH étudiera votre dossier dans les plus brefs délais.</p>
        <p>Vous serez informé(e) de l’évolution de votre candidature par email.</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${siteUrl}/recrutements/${recruitment.slug}" class="button">Voir l’offre</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          L’équipe Recrutement – Youth Computing
        </p>
      `;
      await this.sendEmail(
        data.email,
        `Confirmation de candidature - ${recruitment.position}`,
        content
      );
    } catch (error) {
      logger.error('Échec de l\'envoi de l\'email de confirmation:', error);
    }

    return candidature;
  }

  // ─── RÉCUPÉRATION DES CANDIDATURES ──────────────────────────

  async getCandidatures(recruitmentId: string): Promise<any[]> {
    return this.candidatureRepository.findMany({
      where: { recruitmentId },
      include: {
        Interview: true,
        Evaluation: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCandidatureStatus(id: string, status: string): Promise<any> {
    return this.candidatureRepository.update(id, { status });
  }

  async getCandidatureStats(recruitmentId: string): Promise<any> {
    const total = await this.candidatureRepository.count({ recruitmentId });
    const pending = await this.candidatureRepository.count({ recruitmentId, status: 'PENDING' });
    const reviewed = await this.candidatureRepository.count({ recruitmentId, status: 'REVIEWED' });
    const shortlisted = await this.candidatureRepository.count({ recruitmentId, status: 'SHORTLISTED' });
    const interviewed = await this.candidatureRepository.count({ recruitmentId, status: 'INTERVIEWED' });
    const accepted = await this.candidatureRepository.count({ recruitmentId, status: 'ACCEPTED' });
    const rejected = await this.candidatureRepository.count({ recruitmentId, status: 'REJECTED' });

    return {
      total,
      pending,
      reviewed,
      shortlisted,
      interviewed,
      accepted,
      rejected,
    };
  }

  toDTO(recruitment: Recruitment): any {
    return {
      id: recruitment.id,
      title: recruitment.title,
      slug: recruitment.slug,
      description: recruitment.description,
      requirements: recruitment.requirements,
      department: recruitment.department,
      position: recruitment.position,
      isActive: recruitment.isActive,
      deadline: recruitment.deadline,
      createdAt: recruitment.createdAt,
      updatedAt: recruitment.updatedAt,
    };
  }
}