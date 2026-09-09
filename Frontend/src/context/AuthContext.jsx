import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(void 0);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    
    if (response.otpRequired) {
      return { otpRequired: true, userId: response.user_id, devOtpCode: response.dev_otp_code };
    }
    
    if (response.token) {
      authService.setToken(response.token);
      authService.setUser(response.user);
      setUser(response.user);
    }
    
    return { success: true, user: response.user };
  };

  const verifyOtp = async (userId, otpCode) => {
    const response = await authService.verifyOtp(userId, otpCode);
    
    if (response.token) {
      authService.setToken(response.token);
      authService.setUser(response.user);
      setUser(response.user);
    }
    
    return { success: true, user: response.user };
  };

  const resendOtp = async (userId) => {
    const response = await authService.resendOtp(userId);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return { success: true, user: response.user };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (updated) => {
    if (!user) return;
    const newUserData = { ...user, ...updated };
    authService.setUser(newUserData);
    setUser(newUserData);
  };

  return <AuthContext.Provider
    value={{
      user,
      isAuthenticated: !!user,
      role: user?.role || "attendee",
      loading,
      login,
      verifyOtp,
      resendOtp,
      register,
      logout,
      updateProfile
    }}
  >
    {children}
  </AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export {
  AuthProvider,
  useAuth
};