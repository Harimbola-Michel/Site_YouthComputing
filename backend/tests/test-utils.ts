import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@utils/password';
import { generateAccessToken, generateRefreshToken } from '@utils/jwt';

export const prisma = new PrismaClient();

export const createTestUser = async (data?: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}) => {
  const hashedPassword = await hashPassword(data?.password || 'Test123!@#');
  
  return prisma.user.create({
    data: {
      email: data?.email || `test-${Date.now()}@example.com`,
      password_hash: hashedPassword,
      firstName: data?.firstName || 'Test',
      lastName: data?.lastName || 'User',
      role: data?.role || 'VIEWER',
      status: 'ACTIVE',
      isActive: true,
    },
  });
};

export const createTestFormation = async (data?: {
  title?: string;
  description?: string;
  duration?: string;
  level?: string;
  price?: number;
  category?: string;
}) => {
  const title = data?.title || `Test Formation ${Date.now()}`;
  
  return prisma.formation.create({
    data: {
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      description: data?.description || 'Test description',
      duration: data?.duration || '4 weeks',
      level: data?.level || 'DÉBUTANT',
      price: data?.price || 0,
      category: data?.category || 'Test Category',
      isPublished: true,
    },
  });
};

export const createTestSession = async (formationId: string, data?: {
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxParticipants?: number;
}) => {
  const now = new Date();
  return prisma.formationSession.create({
    data: {
      formationId,
      startDate: data?.startDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: data?.endDate || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: data?.location || 'Test Location',
      maxParticipants: data?.maxParticipants || 20,
      currentParticipants: 0,
      status: 'SCHEDULED',
    },
  });
};

export const createTestRegistration = async (data: {
  sessionId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}) => {
  return prisma.registration.create({
    data: {
      sessionId: data.sessionId,
      firstName: data.firstName || 'Test',
      lastName: data.lastName || 'User',
      email: data.email || `test-${Date.now()}@example.com`,
      phone: data.phone || '+261331234567',
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });
};

export const createTestY2CMember = async (data?: {
  name?: string;
  email?: string;
  phone?: string;
  badgeNumber?: string;
}) => {
  return prisma.y2cMember.create({
    data: {
      name: data?.name || 'Test Member',
      email: data?.email || `test-${Date.now()}@example.com`,
      phone: data?.phone || '+261331234567',
      badgeNumber: data?.badgeNumber || `Y2C-${Date.now()}`,
      status: 'PENDING',
      membershipFeePaid: 0,
    },
  });
};

export const createTestArticle = async (data: {
  title?: string;
  content?: string;
  authorId: string;
  status?: string;
}) => {
  const title = data.title || `Test Article ${Date.now()}`;
  
  return prisma.article.create({
    data: {
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      content: data.content || 'Test content',
      authorId: data.authorId,
      category: 'Test Category',
      tags: ['test'],
      status: data.status || 'DRAFT',
    },
  });
};

export const createTestPayment = async (data: {
  registrationId?: string;
  y2cMemberId?: string;
  amount?: number;
  status?: string;
}) => {
  return prisma.payment.create({
    data: {
      registrationId: data.registrationId,
      y2cMemberId: data.y2cMemberId,
      amount: data.amount || 1000,
      currency: 'MGA',
      paymentMethod: 'CASH',
      paymentReference: `PAY-${Date.now()}`,
      status: data.status || 'PENDING',
    },
  });
};

export const getAuthHeaders = (user: any) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Refresh-Token': refreshToken,
  };
};

export const mockRequest = (options: {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
  user?: any;
}) => {
  const req = {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    headers: options.headers || {},
    user: options.user,
    ip: '127.0.0.1',
    get: (header: string) => {
      return options.headers?.[header] || null;
    },
  } as Request;
  
  return req;
};

export const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response;
  
  return res;
};

export const mockNext = () => {
  return jest.fn() as NextFunction;
};

export const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateTestData = {
  user: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
  }),
  
  formation: () => ({
    title: `Test Formation ${Date.now()}`,
    description: 'Test description',
    duration: '4 weeks',
    level: 'DÉBUTANT',
    price: 0,
    category: 'Test Category',
  }),
  
  registration: () => ({
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    phone: '+261331234567',
    motivation: 'Test motivation',
  }),
};

export const clearDatabase = async () => {
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.registration.deleteMany(),
    prisma.y2cMember.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.articleComment.deleteMany(),
    prisma.article.deleteMany(),
    prisma.projectMetric.deleteMany(),
    prisma.project.deleteMany(),
    prisma.y2cEventRegistration.deleteMany(),
    prisma.y2cEvent.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.event.deleteMany(),
    prisma.formationSession.deleteMany(),
    prisma.formation.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};