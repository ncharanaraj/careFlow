export type UserRole = "Admin" | "Doctor" | "Staff";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
