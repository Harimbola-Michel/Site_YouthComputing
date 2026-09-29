// src/services/teamMember.service.ts
import { BaseService } from './base.service';
import { TeamMemberRepository } from '../repositories/teamMember.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTeamMemberDTO, UpdateTeamMemberDTO } from '../types/dto/team-member.dto';
import { ApiError } from '../utils/ApiError';
import { TeamMember } from '@prisma/client';

export class TeamMemberService extends BaseService<TeamMember, CreateTeamMemberDTO, UpdateTeamMemberDTO> {
  private teamMemberRepository: TeamMemberRepository;
  private userRepository: UserRepository;

  constructor() {
    super(new TeamMemberRepository());
    this.teamMemberRepository = new TeamMemberRepository();
    this.userRepository = new UserRepository();
  }

  async create(data: CreateTeamMemberDTO): Promise<TeamMember> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findByIdOrThrow(data.userId);

    // Vérifier qu'il n'est pas déjà membre (userId est unique)
    const existing = await this.teamMemberRepository.findByUserId(data.userId);
    if (existing) {
      throw ApiError.conflict('Cet utilisateur est déjà membre de l’équipe');
    }

    const displayOrder = data.displayOrder || 0;

    // ✅ Nettoyer les champs : transformer les chaînes vides en null
    // ✅ department est requis → on fournit une valeur par défaut si absent (normalement validé)
    const cleanData = {
      role: data.role,
      department: data.department || 'Non défini', // fallback si requis
      bio: data.bio || null,
      photoUrl: data.photoUrl || null,
      linkedin: data.linkedin || null,
      displayOrder,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    // ✅ La relation s'appelle "User" (majuscule) selon le schéma Prisma
    return this.teamMemberRepository.create({
      ...cleanData,
      User: {  // ← Attention : majuscule !
        connect: { id: data.userId },
      },
    });
  }

  async update(id: string, data: UpdateTeamMemberDTO): Promise<TeamMember> {
    // Vérifier que le membre existe
    await this.teamMemberRepository.findByIdOrThrow(id);

    // Nettoyer les données
    const cleanData: any = {
      role: data.role,
      department: data.department !== undefined ? data.department : undefined,
      bio: data.bio !== undefined ? (data.bio || null) : undefined,
      photoUrl: data.photoUrl !== undefined ? (data.photoUrl || null) : undefined,
      linkedin: data.linkedin !== undefined ? (data.linkedin || null) : undefined,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    };

    // Supprimer les propriétés undefined
    Object.keys(cleanData).forEach(key => cleanData[key] === undefined && delete cleanData[key]);

    return this.teamMemberRepository.update(id, cleanData);
  }

  async getActiveMembers(): Promise<TeamMember[]> {
    return this.teamMemberRepository.findMany({
      where: { isActive: true },
      include: {
        User: {  // ← Majuscule
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getByDepartment(department: string): Promise<TeamMember[]> {
    return this.teamMemberRepository.findMany({
      where: { department, isActive: true },
      include: {
        User: {  // ← Majuscule
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
      },
    });
  }

  async reorder(memberIds: string[]): Promise<void> {
    for (let i = 0; i < memberIds.length; i++) {
      await this.teamMemberRepository.update(memberIds[i], { displayOrder: i });
    }
  }

  async toggleActive(id: string): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findByIdOrThrow(id);
    return this.teamMemberRepository.update(id, { isActive: !member.isActive });
  }

  async getStats(): Promise<any> {
    return this.teamMemberRepository.getStats();
  }

  toDTO(member: TeamMember & { User?: any }): any {
    return {
      id: member.id,
      userId: member.userId,
      user: member.User
        ? {
            id: member.User.id,
            firstName: member.User.firstName,
            lastName: member.User.lastName,
            fullName: `${member.User.firstName || ''} ${member.User.lastName || ''}`.trim(),
            email: member.User.email,
            avatar: member.User.avatar,
          }
        : undefined,
      role: member.role,
      department: member.department,
      bio: member.bio,
      photoUrl: member.photoUrl,
      linkedin: member.linkedin,
      displayOrder: member.displayOrder,
      isActive: member.isActive,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }
}