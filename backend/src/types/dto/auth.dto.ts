import { Role } from '../roles.enum';
import { UserStatus } from '../roles.enum';

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  password: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface AuthResponseDTO {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: Role;
    status: UserStatus;
    isActive: boolean;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayloadDTO {
  userId: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface LoginHistoryDTO {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginAt: Date;
  success: boolean;
}

export interface SessionDTO {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface RegisterResponseDTO {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: Role;
    status: UserStatus;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message?: string;
}

export interface LogoutDTO {
  refreshToken: string;
}

export interface ValidateTokenDTO {
  token: string;
}

export interface AuthErrorResponseDTO {
  success: boolean;
  message: string;
  statusCode: number;
  errors?: any[];
}