// backend/src/repositories/projectMetric.repository.ts

import { BaseRepository } from './base.repository';
import { Prisma, ProjectMetric } from '@prisma/client';

export class ProjectMetricRepository extends BaseRepository<
  ProjectMetric,
  Prisma.ProjectMetricWhereInput,
  Prisma.ProjectMetricCreateInput,
  Prisma.ProjectMetricUpdateInput
> {
  constructor() {
    super('projectMetric');
  }

  async findByProject(projectId: string): Promise<ProjectMetric[]> {
    return this.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByKey(projectId: string, key: string): Promise<ProjectMetric | null> {
    return this.findFirst({
      projectId,
      metricKey: key,
    });
  }

  async upsertMetric(projectId: string, key: string, value: string, description?: string): Promise<ProjectMetric> {
    const existing = await this.findByKey(projectId, key);

    if (existing) {
      return this.update(existing.id, {
        metricValue: value,
        description: description || existing.description,
      });
    }

    // ✅ Correction : utiliser la relation Prisma "Project" (majuscule)
    return this.create({
      metricKey: key,
      metricValue: value,
      description,
      Project: {
        connect: { id: projectId }
      }
    });
  }

  async deleteByProject(projectId: string): Promise<number> {
    const result = await this.execute(async () => {
      return await this.model.deleteMany({
        where: { projectId },
      });
    });
    return result.count || 0;
  }

  async getMetricKeys(projectId: string): Promise<string[]> {
    const metrics = await this.findMany({
      where: { projectId },
      select: { metricKey: true },
    });
    return metrics.map(m => m.metricKey);
  }

  async getValue(projectId: string, key: string): Promise<string | null> {
    const metric = await this.findByKey(projectId, key);
    return metric ? metric.metricValue : null;
  }

  async getNumericValue(projectId: string, key: string): Promise<number | null> {
    const value = await this.getValue(projectId, key);
    return value ? parseFloat(value) : null;
  }
}