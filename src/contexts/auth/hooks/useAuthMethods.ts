
import { User, UserRole } from "../types";
import { useLogin } from "./useLogin";
import { useRegistration } from "./useRegistration";
import { useProfileManagement } from "./useProfileManagement";
import { useLogout } from "./useLogout";
import { usePasswordReset } from "./usePasswordReset";

export const useAuthMethods = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { login, loginWithOAuth } = useLogin(setUser, setLoading);
  const { register } = useRegistration(setUser, setLoading);
  const { updateProfile } = useProfileManagement(setUser);
  const { logout } = useLogout(setUser);
  const { sendPasswordResetEmail, updatePassword } = usePasswordReset();

  return {
    login,
    loginWithOAuth,
    register,
    updateProfile,
    logout,
    sendPasswordResetEmail,
    updatePassword
  };
};
