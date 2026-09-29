import { BaseRepository } from './base.repository';
import { Prisma, Evaluation } from '@prisma/client';

export class EvaluationRepository extends BaseRepository<
  Evaluation,
  Prisma.EvaluationWhereInput,
  Prisma.EvaluationCreateInput,
  Prisma.EvaluationUpdateInput
> {
  constructor() {
    super('evaluation');
  }

  async findByCandidature(candidatureId: string): Promise<Evaluation[]> {
    return this.findMany({
      where: { candidatureId },
      include: {
        evaluator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEvaluator(evaluatorId: string): Promise<Evaluation[]> {
    return this.findMany({
      where: { evaluatorId },
      include: {
        candidature: {
          include: {
            recruitment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageScore(candidatureId: string): Promise<number> {
    const evaluations = await this.findMany({
      where: { candidatureId },
      select: { score: true },
    });

    if (evaluations.length === 0) return 0;

    const total = evaluations.reduce((sum, e) => sum + e.score, 0);
    return Math.round((total / evaluations.length) * 10) / 10;
  }

  async getStats(): Promise<{
    total: number;
    averageScore: number;
    byCriteria: Record<string, { count: number; average: number }>;
  }> {
    const evaluations = await this.findMany({});
    const total = evaluations.length;

    if (total === 0) {
      return { total: 0, averageScore: 0, byCriteria: {} };
    }

    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const averageScore = Math.round((totalScore / total) * 10) / 10;

    const byCriteria: Record<string, { count: number; average: number }> = {};
    for (const eval_ of evaluations) {
      if (!byCriteria[eval_.criteria]) {
        byCriteria[eval_.criteria] = { count: 0, average: 0 };
      }
      byCriteria[eval_.criteria].count += 1;
      byCriteria[eval_.criteria].average += eval_.score;
    }

    for (const criteria of Object.keys(byCriteria)) {
      byCriteria[criteria].average = Math.round((byCriteria[criteria].average / byCriteria[criteria].count) * 10) / 10;
    }

    return { total, averageScore, byCriteria };
  }
}