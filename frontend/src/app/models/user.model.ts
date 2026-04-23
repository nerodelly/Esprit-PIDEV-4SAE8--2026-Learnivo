export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  SOCIETY_AGENT = 'SOCIETY_AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export interface User {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  societyName?: string;
  societyEmail?: string;
  societyPhone?: string;
  societyAddress?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  societyName?: string;
  societyEmail?: string;
  societyPhone?: string;
  societyAddress?: string;
  recaptchaToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: Role;
}

export interface MeResponse {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  societyName?: string;
  societyEmail?: string;
  societyPhone?: string;
  societyAddress?: string;
}
