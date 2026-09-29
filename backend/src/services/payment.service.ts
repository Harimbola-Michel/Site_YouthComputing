import { BaseService } from './base.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../types/dto/payment.dto';
import { ApiError } from '../utils/ApiError';
import { Payment, PaymentStatus } from '@prisma/client';
import { mailer } from '../config/mailer';
import { logger } from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../prisma/client'; // ✅ Import du client Prisma

export class PaymentService extends BaseService<Payment, CreatePaymentDTO, UpdatePaymentDTO> {
  private paymentRepository: PaymentRepository;
  private registrationRepository: RegistrationRepository;
  private y2cMemberRepository: Y2CMemberRepository;
  private userRepository: UserRepository;

  constructor() {
    super(new PaymentRepository());
    this.paymentRepository = new PaymentRepository();
    this.registrationRepository = new RegistrationRepository();
    this.y2cMemberRepository = new Y2CMemberRepository();
    this.userRepository = new UserRepository();
  }

  // ─── CRÉATION ──────────────────────────────────────────────

  async create(data: CreatePaymentDTO): Promise<Payment> {
    const reference = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const payment = await this.paymentRepository.create({
      ...data,
      paymentReference: data.paymentReference || reference,
      status: 'PENDING',
    });

    if (data.registrationId) {
      await this.registrationRepository.update(data.registrationId, {
        paymentStatus: 'PENDING',
        paymentAmount: data.amount,
        paymentReference: payment.paymentReference,
      });
    }

    if (data.y2cMemberId) {
      await this.y2cMemberRepository.update(data.y2cMemberId, {
        membershipFeePaid: data.amount,
      });
    }

    try {
      await this.sendPaymentConfirmation(payment);
    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
    }

    return payment;
  }

  // ─── CONFIRMER ─────────────────────────────────────────────

  async confirmPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    if (payment.status === 'PAID') {
      throw ApiError.badRequest('Payment already confirmed');
    }

    const updated = await this.paymentRepository.update(id, {
      status: 'PAID',
      paidAt: new Date(),
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'PAID',
      });
    }

    if (payment.y2cMemberId) {
      await this.y2cMemberRepository.update(payment.y2cMemberId, {
        status: 'ACTIVE',
      });
    }

    try {
      await this.sendPaymentSuccess(updated);
    } catch (error) {
      logger.error('Failed to send payment success email:', error);
    }

    return updated;
  }

  // ─── ÉCHOUER ──────────────────────────────────────────────

  async failPayment(id: string, reason?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    const updated = await this.paymentRepository.update(id, {
      status: 'FAILED',
      metadata: {
        ...(payment.metadata as any || {}),
        failureReason: reason,
        failedAt: new Date(),
      },
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'FAILED',
      });
    }

    return updated;
  }

  // ─── REMBOURSER ───────────────────────────────────────────

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByIdOrThrow(id);

    if (payment.status !== 'PAID') {
      throw ApiError.badRequest('Only paid payments can be refunded');
    }

    const updated = await this.paymentRepository.update(id, {
      status: 'REFUNDED',
      metadata: {
        ...(payment.metadata as any || {}),
        refundedAt: new Date(),
      },
    });

    if (payment.registrationId) {
      await this.registrationRepository.update(payment.registrationId, {
        paymentStatus: 'REFUNDED',
      });
    }

    return updated;
  }

  // ─── STATISTIQUES ─────────────────────────────────────────

  async getStats(): Promise<any> {
    const total = await this.paymentRepository.count();
    const totalAmount = await this.paymentRepository.sum('amount', { status: 'PAID' });
    const pending = await this.paymentRepository.count({ status: 'PENDING' });
    const paid = await this.paymentRepository.count({ status: 'PAID' });
    const failed = await this.paymentRepository.count({ status: 'FAILED' });
    const refunded = await this.paymentRepository.count({ status: 'REFUNDED' });

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const todayAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: todayStart },
    });
    const monthAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: monthStart },
    });
    const yearAmount = await this.paymentRepository.sum('amount', {
      status: 'PAID',
      paidAt: { gte: yearStart },
    });

    const byMethod = await this.paymentRepository.groupBy('paymentMethod');

    return {
      total,
      totalAmount: totalAmount || 0,
      pending,
      paid,
      failed,
      refunded,
      today: { amount: todayAmount || 0 },
      thisMonth: { amount: monthAmount || 0 },
      thisYear: { amount: yearAmount || 0 },
      byMethod,
    };
  }

  // ─── RÉCUPÉRER LES PAIEMENTS D'UN UTILISATEUR ──────────────

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur non trouvé');
    }

    const registrations = await this.registrationRepository.findMany({
      where: { email: user.email },
    });
    const registrationIds = registrations.map((r) => r.id);

    const y2cMembers = await this.y2cMemberRepository.findMany({
      where: { email: user.email },
    });
    const y2cMemberIds = y2cMembers.map((m) => m.id);

    const conditions: any[] = [];
    if (registrationIds.length > 0) {
      conditions.push({ registrationId: { in: registrationIds } });
    }
    if (y2cMemberIds.length > 0) {
      conditions.push({ y2cMemberId: { in: y2cMemberIds } });
    }

    if (conditions.length === 0) {
      return [];
    }

    return this.paymentRepository.findMany({
      where: {
        OR: conditions,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── ENVOI D'EMAILS (privé) ──────────────────────────────

  private async sendPaymentConfirmation(payment: Payment): Promise<void> {
    let email = '';
    let name = '';

    if (payment.registrationId) {
      const registration = await this.registrationRepository.findById(payment.registrationId);
      if (registration) {
        email = registration.email;
        name = `${registration.firstName} ${registration.lastName}`;
      }
    } else if (payment.y2cMemberId) {
      const member = await this.y2cMemberRepository.findById(payment.y2cMemberId);
      if (member) {
        email = member.email;
        name = member.name;
      }
    }

    if (email) {
      await mailer.sendTemplatedEmail(email, 'payment-confirmation', {
        name,
        content: `
          <h2>Confirmation de paiement</h2>
          <p>Nous avons bien reçu votre paiement.</p>
          <p><strong>Référence:</strong> ${payment.paymentReference}</p>
          <p><strong>Montant:</strong> ${payment.amount} ${payment.currency}</p>
          <p><strong>Méthode:</strong> ${payment.paymentMethod}</p>
          <p>Votre paiement est en cours de traitement.</p>
        `,
      });
    }
  }

  private async sendPaymentSuccess(payment: Payment): Promise<void> {
    let email = '';
    let name = '';

    if (payment.registrationId) {
      const registration = await this.registrationRepository.findById(payment.registrationId);
      if (registration) {
        email = registration.email;
        name = `${registration.firstName} ${registration.lastName}`;
      }
    } else if (payment.y2cMemberId) {
      const member = await this.y2cMemberRepository.findById(payment.y2cMemberId);
      if (member) {
        email = member.email;
        name = member.name;
      }
    }

    if (email) {
      await mailer.sendTemplatedEmail(email, 'payment-success', {
        name,
        content: `
          <h2>Paiement confirmé</h2>
          <p>Votre paiement a été confirmé avec succès.</p>
          <p><strong>Référence:</strong> ${payment.paymentReference}</p>
          <p><strong>Montant:</strong> ${payment.amount} ${payment.currency}</p>
          <p>Merci pour votre confiance.</p>
        `,
      });
    }
  }

  // ─── ENVOI DU REÇU (public) ──────────────────────────────

  async sendReceipt(paymentId: string): Promise<{ message: string }> {
    const payment = await this.paymentRepository.findByIdOrThrow(paymentId);

    let email = '';
    let name = '';
    let description = '';

    if (payment.registrationId) {
      // ✅ Utiliser Prisma directement pour inclure la relation Formation
      const registration = await prisma.registration.findUnique({
        where: { id: payment.registrationId },
        include: { Formation: true },
      });
      if (registration) {
        email = registration.email;
        name = `${registration.firstName} ${registration.lastName}`.trim();
        description = `Inscription à la formation ${registration.Formation?.title || ''}`;
      }
    } else if (payment.y2cMemberId) {
      const member = await this.y2cMemberRepository.findById(payment.y2cMemberId);
      if (member) {
        email = member.email;
        name = member.name;
        description = 'Adhésion Y2C';
      }
    }

    if (!email) {
      throw ApiError.badRequest('Impossible de trouver l\'email du destinataire');
    }

    await mailer.sendTemplatedEmail(
      email,
      'payment-receipt',
      {
        name: name || 'Client',
        paymentReference: payment.paymentReference,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('fr-FR') : 'Non payé',
        status: payment.status,
        description,
        content: `
          <h2>Reçu de paiement</h2>
          <p>Bonjour ${name || 'Client'},</p>
          <p>Nous vous confirmons le paiement suivant :</p>
          <ul>
            <li><strong>Référence :</strong> ${payment.paymentReference}</li>
            <li><strong>Montant :</strong> ${payment.amount} ${payment.currency}</li>
            <li><strong>Méthode :</strong> ${payment.paymentMethod}</li>
            <li><strong>Statut :</strong> ${payment.status}</li>
            <li><strong>Description :</strong> ${description}</li>
            ${payment.paidAt ? `<li><strong>Payé le :</strong> ${new Date(payment.paidAt).toLocaleDateString('fr-FR')}</li>` : ''}
          </ul>
          <p>Merci pour votre confiance.</p>
          <p>L'équipe Youth Computing</p>
        `,
      }
    );

    return { message: 'Reçu envoyé avec succès' };
  }

  // ─── DTO ───────────────────────────────────────────────────

  toDTO(payment: Payment): any {
    return {
      id: payment.id,
      registrationId: payment.registrationId,
      y2cMemberId: payment.y2cMemberId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference,
      status: payment.status,
      metadata: payment.metadata,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}