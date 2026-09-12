export type UserRole = "Admin" | "Doctor" | "Staff";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  doctorId?: string | number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
