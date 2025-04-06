
import { User, UserRole } from "../types";
import { useLogin } from "./useLogin";
import { useRegistration } from "./useRegistration";
import { useProfileManagement } from "./useProfileManagement";
import { useLogout } from "./useLogout";

export const useAuthMethods = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { login, loginWithOAuth } = useLogin(setUser, setLoading);
  const { register } = useRegistration(setUser, setLoading);
  const { updateProfile } = useProfileManagement(setUser);
  const { logout } = useLogout(setUser);

  return {
    login,
    loginWithOAuth,
    register,
    updateProfile,
    logout
  };
};
