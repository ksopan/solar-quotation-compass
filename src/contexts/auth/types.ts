
export type UserRole = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithOAuth: (provider: "google" | "twitter") => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string, role: UserRole }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isProfileComplete: () => boolean;
}
