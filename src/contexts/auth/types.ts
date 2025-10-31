
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
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string; role: UserRole; questionnaireData?: any; fromQuestionnaireFlow?: boolean }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isProfileComplete: () => boolean;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}
