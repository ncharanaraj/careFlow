import type { AuthUser, LoginCredentials } from "@/types/auth";

const API_URL = "http://localhost:3001";

interface ApiUser extends AuthUser {
  password: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<AuthUser> => {
  const response = await fetch(
    `${API_URL}/users?email=${encodeURIComponent(credentials.email)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to login");
  }

  const users: ApiUser[] = await response.json();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === credentials.email.toLowerCase() &&
      item.password === credentials.password,
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const authenticatedUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    doctorId: user.doctorId,
  };

  return authenticatedUser;
};
