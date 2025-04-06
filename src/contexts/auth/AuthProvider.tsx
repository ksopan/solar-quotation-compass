
import React, { createContext } from "react";
import { AuthContextType } from "./types";
import { useAuthSetup, useAuthMethods } from "./hooks";
import { isProfileComplete } from "./authUtils";

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, loading, setLoading } = useAuthSetup();
  
  const { login, loginWithOAuth, register, updateProfile, logout } = useAuthMethods(setUser, setLoading);

  // Check if user profile is complete
  const checkProfileComplete = () => {
    return isProfileComplete(user);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithOAuth,
      logout, 
      register, 
      updateProfile,
      isProfileComplete: checkProfileComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
};
