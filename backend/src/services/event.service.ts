import { BaseService } from './base.service';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDTO, UpdateEventDTO, CreateEventRegistrationDTO } from '../types/dto/event.dto';
import { ApiError } from '../utils/ApiError';
import { Event } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class EventService extends BaseService<Event, CreateEventDTO, UpdateEventDTO> {
  private eventRepository: EventRepository;

  constructor() {
    super(new EventRepository());
    this.eventRepository = new EventRepository();
  }

  // ─── Layout HTML pour les emails ────────────────────────────
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
            <h1>✉️ <span>Youth</span> Computing</h1>
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

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateEventDTO): Promise<Event> {
    const slug = await generateUniqueSlug(data.title, 'event');
    return this.eventRepository.create({
      ...data,
      slug,
      isPublished: data.isPublished || false,
      isPaid: data.isPaid || false,
    });
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateEventDTO): Promise<Event> {
    const event = await this.eventRepository.findByIdOrThrow(id);

    let slug = event.slug;
    if (data.title && data.title !== event.title) {
      slug = await generateUniqueSlug(data.title, 'event');
    }

    return this.eventRepository.update(id, {
      ...data,
      slug,
    });
  }

  // ─── AUTRES MÉTHODES ──────────────────────────────────────
  async getBySlug(slug: string): Promise<Event | null> {
    return this.eventRepository.findBySlug(slug);
  }

  async getPublishedEvents(params: any): Promise<any> {
    return this.eventRepository.findPublished(params);
  }

  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    return this.eventRepository.findUpcoming(limit);
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return this.eventRepository.findByType(type);
  }

  async getStats() {
    return this.eventRepository.getStats();
  }

  // ─── INSCRIPTIONS ──────────────────────────────────────────
  async registerForEvent(eventId: string, data: CreateEventRegistrationDTO): Promise<any> {
    const event = await this.eventRepository.findByIdOrThrow(eventId);

    // Vérifier la capacité
    if (event.maxAttendees) {
      const registrations = await this.eventRepository.getRegistrations(eventId);
      if (registrations.length >= event.maxAttendees) {
        throw ApiError.badRequest('Event is full');
      }
    }

    // Vérifier si déjà inscrit
    const existingRegistrations = await this.eventRepository.getRegistrations(eventId);
    const alreadyRegistered = existingRegistrations.some(r => r.email === data.email);
    if (alreadyRegistered) {
      throw ApiError.conflict('You are already registered for this event');
    }

    const registration = await this.eventRepository.createRegistration({
      eventId,
      ...data,
      status: 'PENDING',
    });

    // ─── Envoyer la confirmation avec template professionnel ──
    try {
      const siteUrl = env.FRONTEND_URL || 'https://youthcomputing.mg';
      const formattedDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const formattedTime = event.time || 'à confirmer';

      const content = `
        <h2>✅ Inscription confirmée</h2>
        <p>Bonjour ${data.name},</p>
        <p>Votre inscription à l’événement <strong>« ${event.title} »</strong> a bien été enregistrée.</p>
        <div class="info-box">
          <p><strong>📅 Date :</strong> ${formattedDate}</p>
          <p><strong>🕒 Heure :</strong> ${formattedTime}</p>
          <p><strong>📍 Lieu :</strong> ${event.location}</p>
          ${event.isPaid && event.price ? `<p><strong>💰 Prix :</strong> ${event.price.toLocaleString()} MGA</p>` : ''}
        </div>
        <p>Nous vous attendons avec impatience !</p>
        <p style="text-align:center; margin-top:20px;">
          <a href="${siteUrl}/events/${event.slug}" class="button">Voir l’événement</a>
        </p>
        <p style="font-size:13px; color:#64748b;">
          Si vous avez des questions, n’hésitez pas à nous contacter.
        </p>
      `;

      const html = this.getEmailLayout(content, 'Confirmation d’inscription');

      await mailer.sendTemplatedEmail(data.email, 'event-registration', {
        name: data.name,
        content,
        html,
      });
      logger.info(`📧 Email d’inscription envoyé à ${data.email}`);
    } catch (error) {
      logger.error('Failed to send event registration email:', error);
    }

    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<any[]> {
    return this.eventRepository.getRegistrations(eventId);
  }

  async confirmRegistration(id: string): Promise<any> {
    return this.eventRepository.updateRegistration(id, {
      status: 'CONFIRMED',
    });
  }

  async cancelRegistration(id: string): Promise<any> {
    return this.eventRepository.updateRegistration(id, {
      status: 'CANCELLED',
    });
  }

  toDTO(event: Event): any {
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate,
      time: event.time,
      location: event.location,
      maxAttendees: event.maxAttendees,
      isPaid: event.isPaid,
      price: event.price,
      imageUrl: event.imageUrl,
      isPublished: event.isPublished,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}