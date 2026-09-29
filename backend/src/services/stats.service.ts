import { Prisma } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { FormationRepository } from '../repositories/formation.repository';
import { RegistrationRepository } from '../repositories/registration.repository';
import { Y2CMemberRepository } from '../repositories/y2cMember.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { ArticleRepository } from '../repositories/article.repository';
import { PaymentRepository } from '../repositories/payment.repository';
import { ContactMessageRepository } from '../repositories/contactMessage.repository';
import { logger } from '../config/logger';

export class StatsService {
  private userRepository: UserRepository;
  private formationRepository: FormationRepository;
  private registrationRepository: RegistrationRepository;
  private y2cMemberRepository: Y2CMemberRepository;
  private projectRepository: ProjectRepository;
  private articleRepository: ArticleRepository;
  private paymentRepository: PaymentRepository;
  private contactRepository: ContactMessageRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.formationRepository = new FormationRepository();
    this.registrationRepository = new RegistrationRepository();
    this.y2cMemberRepository = new Y2CMemberRepository();
    this.projectRepository = new ProjectRepository();
    this.articleRepository = new ArticleRepository();
    this.paymentRepository = new PaymentRepository();
    this.contactRepository = new ContactMessageRepository();
  }

  async getGlobalStats(): Promise<any> {
    try {
      const [
        userStats,
        formationStats,
        registrationStats,
        y2cStats,
        projectStats,
        articleStats,
        paymentStats,
        contactStats,
      ] = await Promise.all([
        this.userRepository.getStats(),
        this.formationRepository.getStats(),
        this.registrationRepository.getStats(),
        this.y2cMemberRepository.getStats(),
        this.projectRepository.getStats(),
        this.articleRepository.getStats(),
        this.paymentRepository.getStats(),
        this.contactRepository.getStats(),
      ]);

      return {
        users: userStats,
        formations: formationStats,
        registrations: registrationStats,
        y2c: y2cStats,
        projects: projectStats,
        articles: articleStats,
        payments: paymentStats,
        contacts: contactStats,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get global stats:', error);
      throw error;
    }
  }

  async getDailyStats(date?: Date): Promise<any> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Typage explicite des filtres pour chaque modèle
    const whereUser: Prisma.UserWhereInput = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };
    const whereRegistration: Prisma.RegistrationWhereInput = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };
    const whereY2C: Prisma.Y2CMemberWhereInput = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };
    const wherePayment: Prisma.PaymentWhereInput = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };
    const whereContact: Prisma.ContactMessageWhereInput = {
      createdAt: { gte: startOfDay, lte: endOfDay },
    };

    const [
      newUsers,
      newRegistrations,
      newY2CMembers,
      newPayments,
      newMessages,
    ] = await Promise.all([
      this.userRepository.count(whereUser),
      this.registrationRepository.count(whereRegistration),
      this.y2cMemberRepository.count(whereY2C),
      this.paymentRepository.count(wherePayment),
      this.contactRepository.count(whereContact),
    ]);

    const payments = await this.paymentRepository.findMany({
      where: {
        ...wherePayment,
        status: 'PAID',
      },
    });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      date: targetDate,
      newUsers,
      newRegistrations,
      newY2CMembers,
      newPayments,
      newMessages,
      revenue: totalAmount,
    };
  }

  async getMonthlyStats(year?: number, month?: number): Promise<any> {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month !== undefined ? month - 1 : new Date().getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const whereUser: Prisma.UserWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };
    const whereRegistration: Prisma.RegistrationWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };
    const whereY2C: Prisma.Y2CMemberWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };
    const wherePayment: Prisma.PaymentWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };
    const whereContact: Prisma.ContactMessageWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };

    const [
      newUsers,
      newRegistrations,
      newY2CMembers,
      newPayments,
      newMessages,
    ] = await Promise.all([
      this.userRepository.count(whereUser),
      this.registrationRepository.count(whereRegistration),
      this.y2cMemberRepository.count(whereY2C),
      this.paymentRepository.count(wherePayment),
      this.contactRepository.count(whereContact),
    ]);

    const payments = await this.paymentRepository.findMany({
      where: {
        ...wherePayment,
        status: 'PAID',
      },
    });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const dailyBreakdown = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dailyStats = await this.getDailyStats(date);
      dailyBreakdown.push(dailyStats);
    }

    return {
      year: targetYear,
      month: targetMonth + 1,
      total: {
        newUsers,
        newRegistrations,
        newY2CMembers,
        newPayments,
        newMessages,
        revenue: totalAmount,
      },
      daily: dailyBreakdown,
    };
  }

  async getYearlyStats(year?: number): Promise<any> {
    const targetYear = year || new Date().getFullYear();
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const monthlyStats = await this.getMonthlyStats(targetYear, month);
      monthlyBreakdown.push(monthlyStats);
    }

    const totals = monthlyBreakdown.reduce((acc, m) => ({
      newUsers: acc.newUsers + m.total.newUsers,
      newRegistrations: acc.newRegistrations + m.total.newRegistrations,
      newY2CMembers: acc.newY2CMembers + m.total.newY2CMembers,
      newPayments: acc.newPayments + m.total.newPayments,
      newMessages: acc.newMessages + m.total.newMessages,
      revenue: acc.revenue + m.total.revenue,
    }), {
      newUsers: 0,
      newRegistrations: 0,
      newY2CMembers: 0,
      newPayments: 0,
      newMessages: 0,
      revenue: 0,
    });

    return {
      year: targetYear,
      monthly: monthlyBreakdown,
      totals,
    };
  }

  async getRealtimeStats(): Promise<any> {
    const now = new Date();
    const lastHour = new Date(now);
    lastHour.setHours(now.getHours() - 1);

    const last24Hours = new Date(now);
    last24Hours.setDate(now.getDate() - 1);

    const whereLastHour: Prisma.UserWhereInput = {
      createdAt: { gte: lastHour },
    };
    const whereLast24Hours: Prisma.UserWhereInput = {
      createdAt: { gte: last24Hours },
    };
    const whereRegistrationHour: Prisma.RegistrationWhereInput = {
      createdAt: { gte: lastHour },
    };
    const whereRegistration24h: Prisma.RegistrationWhereInput = {
      createdAt: { gte: last24Hours },
    };
    const wherePaymentHour: Prisma.PaymentWhereInput = {
      createdAt: { gte: lastHour },
    };
    const wherePayment24h: Prisma.PaymentWhereInput = {
      createdAt: { gte: last24Hours },
    };

    const [
      usersLastHour,
      registrationsLastHour,
      paymentsLastHour,
      usersLast24Hours,
      registrationsLast24Hours,
      paymentsLast24Hours,
    ] = await Promise.all([
      this.userRepository.count(whereLastHour),
      this.registrationRepository.count(whereRegistrationHour),
      this.paymentRepository.count(wherePaymentHour),
      this.userRepository.count(whereLast24Hours),
      this.registrationRepository.count(whereRegistration24h),
      this.paymentRepository.count(wherePayment24h),
    ]);

    const payments24h = await this.paymentRepository.findMany({
      where: {
        ...wherePayment24h,
        status: 'PAID',
      },
    });

    const revenue24h = payments24h.reduce((sum, p) => sum + p.amount, 0);

    return {
      lastHour: {
        newUsers: usersLastHour,
        newRegistrations: registrationsLastHour,
        newPayments: paymentsLastHour,
      },
      last24Hours: {
        newUsers: usersLast24Hours,
        newRegistrations: registrationsLast24Hours,
        newPayments: paymentsLast24Hours,
        revenue: revenue24h,
      },
      timestamp: now,
    };
  }
}