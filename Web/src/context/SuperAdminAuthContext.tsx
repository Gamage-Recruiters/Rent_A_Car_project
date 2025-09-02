import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface SuperAdmin {
  id: string;
  email: string;
  userRole: string;
}

interface SuperAdminAuthContextType {
  superAdmin: SuperAdmin | null;
  loginSuperAdmin: (email: string, password: string) => Promise<boolean>;
  logoutSuperAdmin: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  isLoading: boolean;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

export const useSuperAdminAuth = () => {
  const context = useContext(SuperAdminAuthContext);
  if (!context) {
    throw new Error("useSuperAdminAuth must be used within SuperAdminAuthProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

export const SuperAdminAuthProvider: React.FC<Props> = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Login
  const loginSuperAdmin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/superadmin/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setSuperAdmin({
          id: res.data?.id || "",
          email: res.data?.email || email,
          userRole: res.data?.userRole || "super-admin",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("SuperAdmin login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout
  const logoutSuperAdmin = async () => {
    try {
      await axios.post("http://localhost:8000/api/auth/superadmin/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSuperAdmin(null);
    }
  };

  // ✅ Request password reset
  const requestPasswordReset = async (email: string): Promise<string> => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/superadmin/forgot-password", { email });
      return res.data.message || "Password reset email sent.";
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error requesting password reset.");
    }
  };

  // ✅ Complete reset
  const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/superadmin/reset-password", {
        token,
        password: newPassword,
      });
      return res.data.message || "Password has been reset successfully.";
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Error resetting password.");
    }
  };

  return (
    <SuperAdminAuthContext.Provider
      value={{
        superAdmin,
        loginSuperAdmin,
        logoutSuperAdmin,
        requestPasswordReset,
        resetPassword,
        isLoading,
      }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
};
