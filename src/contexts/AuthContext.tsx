
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export type UserRole = "customer" | "vendor" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string, role: UserRole }) => Promise<void>;
}

// Mock user database
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "customer@example.com",
    password: "password",
    role: "customer",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main St",
    phone: "555-1234"
  },
  {
    id: "2",
    email: "vendor@example.com",
    password: "password",
    role: "vendor",
    companyName: "Solar Solutions Inc",
    firstName: "Jane",
    lastName: "Smith",
    address: "456 Business Ave",
    phone: "555-5678"
  },
  {
    id: "3",
    email: "admin@example.com",
    password: "password",
    role: "admin",
    firstName: "Admin",
    lastName: "User"
  }
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (using localStorage in this demo)
  useEffect(() => {
    const storedUser = localStorage.getItem("solarUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Simulate API call
      const foundUser = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("solarUser", JSON.stringify(userWithoutPassword));
        toast.success("Logged in successfully!");
      } else {
        throw new Error("Invalid credentials or user role");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string, role: UserRole }) => {
    setLoading(true);
    try {
      // Check if email already exists
      if (mockUsers.some(u => u.email === userData.email)) {
        throw new Error("Email already registered");
      }

      // In a real app, you would send this data to an API
      const newUser: User & { password: string } = {
        id: Math.random().toString(36).substring(2, 9),
        email: userData.email!,
        password: userData.password,
        role: userData.role,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        companyName: userData.companyName || "",
        address: userData.address || "",
        phone: userData.phone || ""
      };

      // Add user to mock database
      mockUsers.push(newUser);
      
      // Auto login after registration
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("solarUser", JSON.stringify(userWithoutPassword));
      
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("solarUser");
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
