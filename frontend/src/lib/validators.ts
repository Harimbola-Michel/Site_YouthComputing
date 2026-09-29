import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Doit contenir un caractère spécial'),
  firstName: z.string().min(2, 'Prénom requis').max(50),
  lastName: z.string().min(2, 'Nom requis').max(50),
  phone: z.string().optional(),
});

// Formation validators
export const formationSchema = z.object({
  title: z.string().min(3, 'Titre requis').max(200),
  description: z.string().min(10, 'Description requise'),
  objectives: z.string().optional(),
  prerequisites: z.string().optional(),
  duration: z.string().min(1, 'Durée requise'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  price: z.number().min(0).optional(),
  category: z.string().min(1, 'Catégorie requise'),
  imageUrl: z.string().url('URL invalide').optional(),
  isPublished: z.boolean().default(false),
  maxParticipants: z.number().int().positive().optional(),
});

// Article validators
export const articleSchema = z.object({
  title: z.string().min(3, 'Titre requis').max(200),
  content: z.string().min(10, 'Contenu requis'),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url('URL invalide').optional(),
  category: z.string().min(1, 'Catégorie requise'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

// Project validators
export const projectSchema = z.object({
  title: z.string().min(3, 'Titre requis').max(200),
  description: z.string().min(10, 'Description requise'),
  objectives: z.string().optional(),
  impact: z.string().optional(),
  technologies: z.array(z.string()).min(1, 'Au moins une technologie requise'),
  images: z.array(z.string().url()).default([]),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  category: z.string().min(1, 'Catégorie requise'),
  isFeatured: z.boolean().default(false),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'EVALUATING']),
  client: z.string().optional(),
  projectUrl: z.string().url('URL invalide').optional(),
  githubUrl: z.string().url('URL invalide').optional(),
});

// Contact validator
export const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  subject: z.string().min(2, 'Sujet requis').max(200),
  message: z.string().min(10, 'Message requis').max(1000),
});

// Y2C Member validator
export const y2cMemberSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Téléphone requis'),
  studentId: z.string().optional(),
  institution: z.string().optional(),
  membershipFeePaid: z.number().min(0).default(0),
});