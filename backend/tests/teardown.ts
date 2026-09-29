import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function teardown() {
  try {
    // Clean up test database
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
    
    await prisma.$disconnect();
    console.log('🧹 Test database cleaned up');
  } catch (error) {
    console.error('❌ Error during teardown:', error);
    throw error;
  }
}