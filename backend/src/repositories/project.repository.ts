import { BaseRepository } from './base.repository';
import { Prisma, Project, ProjectStatus } from '@prisma/client';

export class ProjectRepository extends BaseRepository<
  Project,
  Prisma.ProjectWhereInput,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput
> {
  constructor() {
    super('project');
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return this.findFirst({ slug });
  }

  async findFeatured(): Promise<Project[]> {
    return this.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(category: string): Promise<Project[]> {
    return this.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByYear(year: number): Promise<Project[]> {
    return this.findMany({
      where: { year },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchProjects(query: string): Promise<Project[]> {
    return this.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(): Promise<{
    total: number;
    planning: number;
    inProgress: number;
    completed: number;
    onHold: number;
    cancelled: number;
    evaluating: number;
  }> {
    const [total, planning, inProgress, completed, onHold, cancelled, evaluating] = await Promise.all([
      this.count(),
      this.count({ status: ProjectStatus.PLANNING }),
      this.count({ status: ProjectStatus.IN_PROGRESS }),
      this.count({ status: ProjectStatus.COMPLETED }),
      this.count({ status: ProjectStatus.ON_HOLD }),
      this.count({ status: ProjectStatus.CANCELLED }),
      this.count({ status: ProjectStatus.EVALUATING }),
    ]);

    return { total, planning, inProgress, completed, onHold, cancelled, evaluating };
  }

  async findWithMetrics(id: string): Promise<Project | null> {
    return this.execute(async () => {
      return await this.model.findUnique({
        where: { id },
        include: { metrics: true },
      });
    });
  }
}