// src/services/y2c.service.ts
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { Y2CEventRepository } from '../repositories/y2cEvent.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import {
  CreateY2CMemberDTO,
  UpdateY2CMemberDTO,
  CreateY2CEventDTO,
  UpdateY2CEventDTO,
} from '../types/dto/y2c.dto';
import { ApiError } from '../utils/ApiError';
import { Prisma, Y2CMember, Y2CEvent } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { slugify } from '../utils/slugify';
import prisma from '../../prisma/client';

export class Y2CService {
  private memberRepository: Y2CMemberRepository;
  private eventRepository: Y2CEventRepository;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.memberRepository = new Y2CMemberRepository();
    this.eventRepository = new Y2CEventRepository();
    this.paymentRepository = new PaymentRepository();
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
            <h1>🌟 <span>Youth</span> Computing</h1>
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
    await mailer.sendTemplatedEmail(to, 'y2c-notification', {
      subject,
      html,
      content, // pour compatibilité
    });
    logger.info(`📧 Email Y2C envoyé à ${to}: ${subject}`);
  }

  // ============ MEMBERS ============

  async createMember(data: CreateY2CMemberDTO): Promise<Y2CMember> {
    const existingMember = await this.memberRepository.findByEmail(data.email);
    if (existingMember) {
      throw ApiError.conflict('Email déjà enregistré comme membre Y2C');
    }
    const badgeNumber = await this.generateBadgeNumber();
    const member = await this.memberRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      institution: data.institution || null,
      badgeNumber,
      status: 'PENDING',
    });

    // ─── Email de bienvenue (designé) ──────────────────────
    try {
      const content = `
        <h2>👋 Bienvenue dans la communauté Y2C !</h2>
        <p>Bonjour <strong>${member.name}</strong>,</p>
        <p>Nous sommes ravis de vous compter parmi les membres de <strong>Youth Computing Community (Y2C)</strong>.</p>
        <div class="info-box">
          <p><strong>🔖 Numéro de badge :</strong> ${member.badgeNumber}</p>
          <p><strong>📧 Email :</strong> ${member.email}</p>
        </div>
        <p>Vous recevrez sous peu votre badge numérique. En attendant, explorez les événements et opportunités réservés aux membres Y2C.</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/y2c/events" class="button">Voir les événements</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          L’équipe Youth Computing
        </p>
      `;
      await this.sendEmail(member.email, 'Bienvenue dans la communauté Y2C', content);
    } catch (error) {
      logger.error('Échec envoi email de bienvenue Y2C:', error);
    }

    return member;
  }

  async updateMember(id: string, data: UpdateY2CMemberDTO): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (data.email && data.email !== member.email) {
      const existing = await this.memberRepository.findByEmail(data.email);
      if (existing) throw ApiError.conflict('Email déjà enregistré comme membre Y2C');
    }
    return this.memberRepository.update(id, data);
  }

  async approveMember(id: string): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (member.status === 'ACTIVE') {
      throw ApiError.badRequest('Membre déjà actif');
    }
    const updated = await this.memberRepository.update(id, {
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    // ─── Email d’approbation (designé) ─────────────────────
    try {
      const content = `
        <h2>✅ Votre adhésion Y2C est approuvée !</h2>
        <p>Bonjour <strong>${member.name}</strong>,</p>
        <p>Félicitations ! Votre demande d’adhésion à la communauté <strong>Youth Computing Community (Y2C)</strong> a été approuvée.</p>
        <div class="info-box">
          <p><strong>🔖 Numéro de badge :</strong> ${member.badgeNumber}</p>
          <p><strong>📅 Date d’adhésion :</strong> ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <p>Vous avez désormais accès à tous les avantages réservés aux membres Y2C :</p>
        <ul>
          <li>🎯 Événements exclusifs</li>
          <li>🤝 Réseautage avec des experts</li>
          <li>📚 Ressources et formations</li>
        </ul>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/y2c/dashboard" class="button">Accéder à mon espace Y2C</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          Bienvenue officiellement dans la famille Y2C !
        </p>
      `;
      await this.sendEmail(member.email, 'Adhésion Y2C approuvée', content);
    } catch (error) {
      logger.error('Échec envoi email d\'approbation:', error);
    }

    return updated;
  }

  async getMemberById(id: string): Promise<Y2CMember> {
    return this.memberRepository.findByIdOrThrow(id);
  }

  async getMemberByEmail(email: string): Promise<Y2CMember | null> {
    return this.memberRepository.findByEmail(email);
  }

  async deleteMember(id: string): Promise<void> {
    await this.memberRepository.findByIdOrThrow(id);
    await this.memberRepository.delete(id);
  }

  async getMemberStats() {
    return this.memberRepository.getStats();
  }

  async findMembers(params: any) {
    return this.memberRepository.findPaginated(params);
  }

  async generateBadges(): Promise<{ generated: number; message: string }> {
    const allMembers = await this.memberRepository.findMany({});
    const membersWithoutBadge = allMembers.filter((member) => !member.badgeNumber);
    if (membersWithoutBadge.length === 0) {
      return { generated: 0, message: 'Tous les membres ont déjà un badge.' };
    }
    let generatedCount = 0;
    for (const member of membersWithoutBadge) {
      const newBadge = await this.generateBadgeNumber();
      await this.memberRepository.update(member.id, {
        badgeNumber: newBadge,
        status: 'ACTIVE',
      });
      generatedCount++;

      // ─── Email du badge (designé) ────────────────────────
      try {
        const content = `
          <h2>🔖 Votre badge Y2C est prêt !</h2>
          <p>Bonjour <strong>${member.name}</strong>,</p>
          <p>Votre badge numérique de membre <strong>Youth Computing Community</strong> a été généré.</p>
          <div class="info-box">
            <p><strong>🔖 Numéro de badge :</strong> ${newBadge}</p>
          </div>
          <p>Ce badge vous identifie en tant que membre actif de la communauté. Vous pouvez le présenter lors de nos événements.</p>
          <p style="text-align:center; margin-top:20px;">
            <a href="${env.FRONTEND_URL}/y2c/dashboard" class="button">Voir mon profil Y2C</a>
          </p>
          <p style="font-size:13px; color:#64748b;">
            Bienvenue parmi nous !
          </p>
        `;
        await this.sendEmail(member.email, 'Votre badge Y2C est prêt', content);
      } catch (error) {
        logger.error(`Échec envoi email badge à ${member.email}:`, error);
      }
    }
    return { generated: generatedCount, message: `${generatedCount} badge(s) généré(s).` };
  }

  async generateBadgeForMember(id: string): Promise<Y2CMember> {
    const member = await this.memberRepository.findByIdOrThrow(id);
    if (member.badgeNumber) {
      throw ApiError.badRequest('Ce membre a déjà un badge.');
    }
    const newBadge = await this.generateBadgeNumber();
    const updated = await this.memberRepository.update(id, {
      badgeNumber: newBadge,
      status: 'ACTIVE',
    });

    // ─── Email du badge (designé) ────────────────────────
    try {
      const content = `
        <h2>🔖 Votre badge Y2C est prêt !</h2>
        <p>Bonjour <strong>${updated.name}</strong>,</p>
        <p>Votre badge numérique de membre <strong>Youth Computing Community</strong> a été généré.</p>
        <div class="info-box">
          <p><strong>🔖 Numéro de badge :</strong> ${newBadge}</p>
        </div>
        <p>Ce badge vous identifie en tant que membre actif de la communauté. Vous pouvez le présenter lors de nos événements.</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/y2c/dashboard" class="button">Voir mon profil Y2C</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          Bienvenue parmi nous !
        </p>
      `;
      await this.sendEmail(updated.email, 'Votre badge Y2C est prêt', content);
    } catch (error) {
      logger.error(`Échec envoi email badge à ${updated.email}:`, error);
    }

    return updated;
  }

  private async generateBadgeNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count() + 1;
    const padded = String(count).padStart(4, '0');
    return `Y2C-${year}-${padded}`;
  }

  // ============ EVENTS ============

  async createEvent(data: CreateY2CEventDTO): Promise<Y2CEvent> {
    let baseSlug = slugify(data.title);
    if (!baseSlug) baseSlug = 'event';
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.y2CEvent.findFirst({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    const createData = {
      ...data,
      slug,
      isPublished: data.isPublished ?? false,
      isPaid: data.isPaid ?? false,
    } as Prisma.Y2CEventCreateInput;
    return this.eventRepository.create(createData);
  }

  async updateEvent(id: string, data: UpdateY2CEventDTO): Promise<Y2CEvent> {
    const event = await this.eventRepository.findByIdOrThrow(id);
    let slug = event.slug;
    if (data.title && data.title !== event.title) {
      let baseSlug = slugify(data.title);
      if (!baseSlug) baseSlug = 'event';
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await prisma.y2CEvent.findFirst({
          where: { slug, NOT: { id: event.id } },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    return this.eventRepository.update(id, { ...data, slug });
  }

  async getEvent(id: string): Promise<Y2CEvent> {
    return this.eventRepository.findByIdOrThrow(id);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventRepository.findByIdOrThrow(id);
    await this.eventRepository.delete(id);
  }

  async getEventStats() {
    return this.eventRepository.getStats();
  }

  async findEvents(params: any) {
    return this.eventRepository.findPaginated(params);
  }

  // ─── Inscription à un événement Y2C ──────────────────────────

  async registerForEvent(eventId: string, data: { fullName: string; email: string; phone: string }): Promise<any> {
    const event = await this.eventRepository.findByIdOrThrow(eventId);
    if (!event.isPublished) {
      throw ApiError.badRequest('Cet événement n\'est pas disponible');
    }

    const existing = await this.eventRepository.getRegistrations(eventId);
    const alreadyRegistered = existing.some((r: any) => r.email === data.email);
    if (alreadyRegistered) {
      throw ApiError.conflict('Vous êtes déjà inscrit à cet événement');
    }

    if (event.maxParticipants) {
      if (existing.length >= event.maxParticipants) {
        throw ApiError.badRequest('Désolé, l\'événement est complet');
      }
    }

    const registration = await this.eventRepository.createRegistration({
      Y2CEvent: { connect: { id: eventId } },
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      status: 'PENDING',
    });

    // ─── Email de confirmation d’inscription (designé) ──────
    try {
      const formattedDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // ✅ Correction : extraction de l'heure depuis startDate (car event.time n'existe pas)
      const formattedTime = event.startDate
        ? new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : 'à confirmer';

      const content = `
        <h2>✅ Inscription confirmée</h2>
        <p>Bonjour <strong>${data.fullName}</strong>,</p>
        <p>Votre inscription à l’événement Y2C <strong>« ${event.title} »</strong> a bien été enregistrée.</p>
        <div class="info-box">
          <p><strong>📅 Date :</strong> ${formattedDate}</p>
          <p><strong>🕒 Heure :</strong> ${formattedTime}</p>
          <p><strong>📍 Lieu :</strong> ${event.location}</p>
          ${event.isPaid && event.price ? `<p><strong>💰 Prix :</strong> ${event.price.toLocaleString()} MGA</p>` : ''}
        </div>
        <p>Nous vous attendons avec impatience pour partager ce moment !</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${env.FRONTEND_URL}/y2c/events/${event.slug}" class="button">Voir l’événement</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          L’équipe Y2C – Youth Computing
        </p>
      `;
      await this.sendEmail(data.email, `Confirmation d’inscription - ${event.title}`, content);
    } catch (error) {
      logger.error('Erreur envoi email confirmation:', error);
    }

    return registration;
  }

  async getEventRegistrations(eventId: string) {
    return this.eventRepository.getRegistrations(eventId);
  }
}