import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";
import { IS_DEV_MOCK_ENABLED } from "../mocks/demoAuth";

const AuthContext = createContext(null);

function getRoles(user) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return [...new Set([user?.role, ...roles].filter(Boolean).map((role) => String(role).toLowerCase()))];
}

function primaryRole(user) {
  const roles = getRoles(user);
  return ["super_admin", "event_admin", "student"].find((role) => roles.includes(role)) || roles[0] || "guest";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const syncUnreadCount = useCallback(async (currentUser) => {
    if (!getRoles(currentUser).includes("student")) {
      setUnreadNotifications(0);
      return;
    }
    try {
      setUnreadNotifications(await notificationService.getUnreadCount());
    } catch {
      // The inbox exposes its own loading and error states.
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        const currentUser = await authService.getMe();
        if (active && currentUser) {
          setUser(currentUser);
          await syncUnreadCount(currentUser);
        }
      } catch (error) {
        if (active) setSessionError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => { active = false; };
  }, [syncUnreadCount]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setUnreadNotifications(0);
    };
    window.addEventListener("ganespace:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ganespace:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedUser = await authService.login(credentials);
    setSessionError("");
    setUser(loggedUser);
    await syncUnreadCount(loggedUser);
    return loggedUser;
  }, [syncUnreadCount]);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await authService.updateProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getMe();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setUnreadNotifications(0);
  }, []);

  const roles = useMemo(() => getRoles(user), [user]);
  const role = primaryRole(user);

  return (
    <AuthContext.Provider value={{
      user,
      role,
      roles,
      loading,
      isLoading: loading,
      sessionError,
      isAuthenticated: Boolean(user),
      isDevMock: IS_DEV_MOCK_ENABLED,
      login,
      logout,
      updateProfile,
      refreshUser,
      unreadNotifications,
      setUnreadNotifications,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}
