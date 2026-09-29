import { PartnerRepository } from '../repositories/partner.repository';
import { CreatePartnerDTO, UpdatePartnerDTO, PartnerRequestDTO } from '../types/dto/partner.dto';
import { ApiError } from '../utils/ApiError';
import { Partner, Prisma } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class PartnerService {
  private partnerRepository: PartnerRepository;

  constructor() {
    this.partnerRepository = new PartnerRepository();
  }

  // ─── CRUD ──────────────────────────────────────────────────────

  async findAll(params?: { page?: number; limit?: number; search?: string }): Promise<{
    data: Partner[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search = '' } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.partnerRepository.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      // ✅ Correction : count(where) au lieu de count({ where })
      this.partnerRepository.count(where),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Partner> {
    return this.partnerRepository.findByIdOrThrow(id);
  }

  async create(data: CreatePartnerDTO): Promise<Partner> {
    const partner = await this.partnerRepository.create({
      name: data.name,
      logo: data.logo || null,
      website: data.website || null,
      description: data.description || null,
      email: data.email || null,
      phone: data.phone || null,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
    });

    // Email de notification admin
    try {
      await mailer.sendTemplatedEmail(
        env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
        'partner-created',
        {
          name: data.name,
          content: `
            <h2>Nouveau partenaire ajouté</h2>
            <p><strong>Nom :</strong> ${data.name}</p>
            ${data.website ? `<p><strong>Site web :</strong> ${data.website}</p>` : ''}
            ${data.description ? `<p><strong>Description :</strong> ${data.description}</p>` : ''}
          `,
        }
      );
    } catch (error) {
      logger.error('Erreur envoi email notification partenaire :', error);
    }

    return partner;
  }

  async update(id: string, data: UpdatePartnerDTO): Promise<Partner> {
    await this.partnerRepository.findByIdOrThrow(id);
    const payload: Prisma.PartnerUpdateInput = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.logo !== undefined) payload.logo = data.logo || null;
    if (data.website !== undefined) payload.website = data.website || null;
    if (data.description !== undefined) payload.description = data.description || null;
    if (data.email !== undefined) payload.email = data.email || null;
    if (data.phone !== undefined) payload.phone = data.phone || null;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.displayOrder !== undefined) payload.displayOrder = data.displayOrder;
    return this.partnerRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    await this.partnerRepository.delete(id);
  }

  // ─── Méthodes spécifiques ─────────────────────────────────────

  async getActivePartners(): Promise<Partner[]> {
    return this.partnerRepository.findActive();
  }

  async toggleActive(id: string): Promise<Partner> {
    const partner = await this.partnerRepository.findByIdOrThrow(id);
    return this.partnerRepository.update(id, {
      isActive: !partner.isActive,
    });
  }

  async getStats() {
    return this.partnerRepository.getStats();
  }

  // ✅ Demande de partenariat (public)
  async requestPartnership(data: PartnerRequestDTO): Promise<{ message: string }> {
    // Envoyer un email à l'administrateur
    try {
      await mailer.sendTemplatedEmail(
        env.ADMIN_EMAIL || 'admin@youthcomputing.mg',
        'partner-request',
        {
          name: data.contactName,
          content: `
            <h2>Nouvelle demande de partenariat</h2>
            <p><strong>Entreprise :</strong> ${data.companyName}</p>
            <p><strong>Contact :</strong> ${data.contactName}</p>
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Téléphone :</strong> ${data.phone}</p>
            ${data.website ? `<p><strong>Site web :</strong> ${data.website}</p>` : ''}
            <p><strong>Message :</strong></p>
            <p>${data.message}</p>
          `,
        }
      );
    } catch (error) {
      logger.error('Erreur envoi demande partenariat :', error);
      throw ApiError.internal('Erreur lors de l\'envoi de la demande');
    }

    // Accusé de réception au demandeur
    try {
      await mailer.sendTemplatedEmail(data.email, 'partner-request-received', {
        name: data.contactName,
        content: `
          <h2>Demande de partenariat reçue</h2>
          <p>Nous avons bien reçu votre demande de partenariat pour <strong>${data.companyName}</strong>.</p>
          <p>Nous vous répondrons dans les plus brefs délais.</p>
          <p>L'équipe Youth Computing</p>
        `,
      });
    } catch (error) {
      logger.error('Erreur envoi accusé réception demande partenariat :', error);
    }

    return { message: 'Demande de partenariat envoyée avec succès' };
  }

  // ─── DTO ──────────────────────────────────────────────────────

  toDTO(partner: Partner): any {
    return {
      id: partner.id,
      name: partner.name,
      logo: partner.logo,
      website: partner.website,
      description: partner.description,
      isActive: partner.isActive,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}