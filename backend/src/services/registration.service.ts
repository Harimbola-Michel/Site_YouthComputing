// backend/src/services/registration.service.ts
import prisma from '../lib/prisma';
import {
  CreateRegistrationDTO,
  UpdateRegistrationDTO,
} from '../types/dto/registration.dto';
import { ApiError } from '../utils/ApiError';
import { Registration, RegistrationStatus, PaymentStatus, Prisma } from '@prisma/client';

export class RegistrationService {
  // ─── CRUD ──────────────────────────────────────────────
  async findAll(params?: any): Promise<Registration[]> {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const skip = (page - 1) * limit;

    return prisma.registration.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        Formation: true,          // ✅ Majuscule
        FormationSession: true,   // ✅ Majuscule
      },
    });
  }

  async findById(id: string): Promise<Registration> {
    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
    if (!registration) {
      throw ApiError.notFound('Inscription introuvable');
    }
    return registration;
  }

  async create(data: CreateRegistrationDTO): Promise<Registration> {
    // 1. Vérifier que la session existe
    const session = await prisma.formationSession.findUnique({
      where: { id: data.sessionId },
      include: { Formation: true }, // ✅ Majuscule
    });
    if (!session) {
      throw ApiError.notFound('Session introuvable');
    }

    // 2. Vérifier les places disponibles
    if (session.maxParticipants > 0 && session.currentParticipants >= session.maxParticipants) {
      throw ApiError.conflict('Cette session est complète');
    }

    // 3. Vérifier les doublons
    const existing = await prisma.registration.findFirst({
      where: {
        email: data.email,
        sessionId: data.sessionId,
      },
    });
    if (existing) {
      throw ApiError.conflict('Vous êtes déjà inscrit à cette session');
    }

    // 4. Transaction
    const registration = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          motivation: data.motivation || null,
          formationId: data.formationId ?? null,
          sessionId: data.sessionId,
          paymentAmount: data.paymentAmount ?? 0,
          paymentReference: data.paymentReference || null,
          status: RegistrationStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          notes: data.notes || null,
        },
        include: {
          Formation: true,
          FormationSession: true,
        },
      });

      if (reg.paymentAmount && reg.paymentAmount > 0) {
        await tx.payment.create({
          data: {
            registrationId: reg.id,
            amount: reg.paymentAmount,
            paymentReference: data.paymentReference || `REG-${reg.id}`,
            paymentMethod: 'CASH',
            status: PaymentStatus.PENDING,
          },
        });
      }

      await tx.formationSession.update({
        where: { id: data.sessionId },
        data: { currentParticipants: { increment: 1 } },
      });

      return reg;
    });

    return registration;
  }

  async update(id: string, data: UpdateRegistrationDTO): Promise<Registration> {
    await this.findById(id);
    return prisma.registration.update({
      where: { id },
      data,
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await prisma.registration.delete({ where: { id } });
  }

  // ─── Recherches ──────────────────────────────────────
  async getByEmail(email: string): Promise<Registration[]> {
    return prisma.registration.findMany({
      where: { email },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async getBySession(sessionId: string): Promise<Registration[]> {
    return prisma.registration.findMany({
      where: { sessionId },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async getByFormation(formationId: string): Promise<Registration[]> {
    return prisma.registration.findMany({
      where: { formationId },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async getByStatus(status: RegistrationStatus): Promise<Registration[]> {
    return prisma.registration.findMany({
      where: { status },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  // ─── Statistiques ──────────────────────────────────────
  async getStats() {
    const total = await prisma.registration.count();
    const byStatus = await prisma.registration.groupBy({
      by: ['status'],
      _count: true,
    });
    const byPaymentStatus = await prisma.registration.groupBy({
      by: ['paymentStatus'],
      _count: true,
    });
    return { total, byStatus, byPaymentStatus };
  }

  async getRevenueStats() {
    const totalRevenue = await prisma.registration.aggregate({
      _sum: { paymentAmount: true },
    });
    const paidRevenue = await prisma.registration.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { paymentAmount: true },
    });
    const pendingRevenue = await prisma.registration.aggregate({
      where: { paymentStatus: PaymentStatus.PENDING },
      _sum: { paymentAmount: true },
    });
    return {
      total: totalRevenue._sum.paymentAmount || 0,
      paid: paidRevenue._sum.paymentAmount || 0,
      pending: pendingRevenue._sum.paymentAmount || 0,
    };
  }

  // ─── Actions ──────────────────────────────────────────
  async confirmRegistration(id: string): Promise<Registration> {
    const registration = await this.findById(id);
    if (registration.status === RegistrationStatus.CONFIRMED) {
      throw ApiError.badRequest('Inscription déjà confirmée');
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.update({
        where: { id },
        data: {
          status: RegistrationStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
        include: {
          Formation: true,
          FormationSession: true,
        },
      });

      await tx.payment.updateMany({
        where: { registrationId: id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      return reg;
    });

    return updated;
  }

  async cancelRegistration(id: string): Promise<Registration> {
    const registration = await this.findById(id);
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw ApiError.badRequest('Inscription déjà annulée');
    }

    return prisma.registration.update({
      where: { id },
      data: {
        status: RegistrationStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async completeRegistration(id: string): Promise<Registration> {
    const registration = await this.findById(id);
    if (registration.status === RegistrationStatus.COMPLETED) {
      throw ApiError.badRequest('Inscription déjà complétée');
    }

    return prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.COMPLETED },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  async addToWaitingList(id: string): Promise<Registration> {
    const registration = await this.findById(id);
    if (registration.status === RegistrationStatus.WAITING_LIST) {
      throw ApiError.badRequest('Déjà en liste d\'attente');
    }

    return prisma.registration.update({
      where: { id },
      data: { status: RegistrationStatus.WAITING_LIST },
      include: {
        Formation: true,
        FormationSession: true,
      },
    });
  }

  // ─── DTO ──────────────────────────────────────────────
  toDTO(registration: Registration & {
    Formation?: any;
    FormationSession?: any;
  }): any {
    return {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      email: registration.email,
      phone: registration.phone,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      paymentAmount: registration.paymentAmount,
      sessionId: registration.sessionId,
      formationId: registration.formationId,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      formation: registration.Formation,
      session: registration.FormationSession,
    };
  }
}