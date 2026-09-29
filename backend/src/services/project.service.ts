import { ProjectRepository } from '../repositories/project.repository';
import { ProjectMetricRepository } from '../repositories/projectMetric.repository';
import { CreateProjectDTO, UpdateProjectDTO, CreateProjectMetricDTO } from '../types/dto/project.dto';
import { ApiError } from '../utils/ApiError';
import { Project } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify';
import { prisma } from '../config/prisma';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private metricRepository: ProjectMetricRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.metricRepository = new ProjectMetricRepository();
  }

  async findAll(params?: any): Promise<Project[]> {
    return this.projectRepository.findMany(params);
  }

  async findAllPaginated(page: number, limit: number) {
    return this.projectRepository.findPaginated({
      page,
      limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Project> {
    return this.projectRepository.findByIdOrThrow(id);
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(data: CreateProjectDTO): Promise<Project> {
    const cleanImages = data.images?.filter((url: string) => url && url.trim() !== '') || [];
    const cleanProjectUrl = data.projectUrl && data.projectUrl.trim() !== '' ? data.projectUrl : null;
    const cleanGithubUrl = data.githubUrl && data.githubUrl.trim() !== '' ? data.githubUrl : null;

    // ✅ Appel avec 'project'
    const slug = await generateUniqueSlug(data.title, 'project');

    return this.projectRepository.create({
      ...data,
      slug,
      images: cleanImages,
      projectUrl: cleanProjectUrl,
      githubUrl: cleanGithubUrl,
      status: data.status || 'PLANNING',
    });
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(id: string, data: UpdateProjectDTO): Promise<Project> {
    const project = await this.projectRepository.findByIdOrThrow(id);
    let slug = project.slug;
    if (data.title && data.title !== project.title) {
      slug = await generateUniqueSlug(data.title, 'project');
    }

    const cleanImages = data.images?.filter((url: string) => url && url.trim() !== '') || undefined;
    const cleanProjectUrl = data.projectUrl && data.projectUrl.trim() !== '' ? data.projectUrl : null;
    const cleanGithubUrl = data.githubUrl && data.githubUrl.trim() !== '' ? data.githubUrl : null;

    return this.projectRepository.update(id, {
      ...data,
      slug,
      images: cleanImages,
      projectUrl: cleanProjectUrl,
      githubUrl: cleanGithubUrl,
    });
  }

  async delete(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async getBySlug(slug: string): Promise<Project | null> {
    return this.projectRepository.findBySlug(slug);
  }

  async getFeatured(): Promise<Project[]> {
    return this.projectRepository.findFeatured();
  }

  async getByCategory(category: string): Promise<Project[]> {
    return this.projectRepository.findByCategory(category);
  }

  async getByYear(year: number): Promise<Project[]> {
    return this.projectRepository.findByYear(year);
  }

  async searchProjects(search: string): Promise<Project[]> {
    return this.projectRepository.searchProjects(search);
  }

  async getStats() {
    return this.projectRepository.getStats();
  }

  async getProjectsWithMetrics(id: string): Promise<Project | null> {
    return this.projectRepository.findWithMetrics(id);
  }

  // ============ METRICS ============
  async addMetric(projectId: string, data: CreateProjectMetricDTO): Promise<any> {
    await this.projectRepository.findByIdOrThrow(projectId);
    return this.metricRepository.create({
      ...data,
      Project: { connect: { id: projectId } },
    });
  }

  async updateMetric(id: string, data: Partial<CreateProjectMetricDTO>): Promise<any> {
    return this.metricRepository.update(id, data);
  }

  async deleteMetric(id: string): Promise<void> {
    await this.metricRepository.delete(id);
  }

  async getProjectMetrics(projectId: string): Promise<any[]> {
    return this.metricRepository.findByProject(projectId);
  }

  toDTO(project: Project): any {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      description: project.description,
      objectives: project.objectives,
      impact: project.impact,
      technologies: project.technologies,
      images: project.images,
      year: project.year,
      category: project.category,
      isFeatured: project.isFeatured,
      status: project.status,
      client: project.client,
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}