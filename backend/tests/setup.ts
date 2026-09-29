import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from '@config/logger';

// Load test environment
dotenv.config({ path: '.env.test' });

// Increase timeout for tests
jest.setTimeout(30000);

// Setup Prisma client for tests
const prisma = new PrismaClient();

// Global setup before all tests
beforeAll(async () => {
  logger.info('🧪 Starting test suite...');
  
  // Ensure test database is clean
  await prisma.$connect();
});

// Cleanup after all tests
afterAll(async () => {
  logger.info('🧪 Test suite completed');
  
  // Clean up test data
  await prisma.$disconnect();
});

// Clear database between tests
beforeEach(async () => {
  // Delete all test data (in order of dependencies)
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
});

// Mock external services
jest.mock('@config/mailer', () => ({
  mailer: {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    sendTemplatedEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  },
}));

jest.mock('@config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
    flushall: jest.fn(),
    on: jest.fn(),
  },
  redisCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    deletePattern: jest.fn(),
    flush: jest.fn(),
  },
}));

jest.mock('@config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'test-id',
        secure_url: 'https://test.com/image.jpg',
        format: 'jpg',
        bytes: 1024,
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
    url: jest.fn().mockReturnValue('https://test.com/image.jpg'),
  },
  cloudinaryConfig: {
    folder: 'test',
    transformation: {},
  },
}));