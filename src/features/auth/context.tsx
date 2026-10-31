"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ky from "ky";
import { toast } from "sonner";
import { AuthContextValue, AuthUser } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_STORAGE_KEY = "codepilot_auth_token";
const USER_STORAGE_KEY = "codepilot_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authDialogMode, setAuthDialogMode] = useState<"signin" | "signup">("signin");

  const openAuthDialog = useCallback((mode: "signin" | "signup" = "signin") => {
    setAuthDialogMode(mode);
    setIsAuthDialogOpen(true);
  }, []);

  const closeAuthDialog = useCallback(() => {
    setIsAuthDialogOpen(false);
  }, []);

  const handleAuthSuccess = useCallback((authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    } catch {
      // Ignore
    }
    setIsAuthDialogOpen(false);
  }, []);

  // Initial session hydration & URL OAuth callback status detection
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      // Fast path: load from localStorage if available
      try {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedUserStr = localStorage.getItem(USER_STORAGE_KEY);
        if (savedToken && savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (isMounted) {
            setToken(savedToken);
            setUser(savedUser);
          }
        }
      } catch {
        // Ignore localStorage error
      }

      // Check URL query parameters for OAuth status
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const authParam = url.searchParams.get("auth");
        const authError = url.searchParams.get("auth_error");

        if (authParam === "success") {
          toast.success("Successfully signed in with Google!");
          url.searchParams.delete("auth");
          window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.search}` : ""));
        } else if (authError) {
          if (authError === "google_not_configured") {
            toast.error("Google OAuth is not configured yet. Set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in .env.local");
            if (isMounted) openAuthDialog("signin");
          } else if (authError === "google_oauth_denied") {
            toast.info("Google sign-in was cancelled.");
          } else {
            toast.error("Google authentication failed. Please try again or use email sign-in.");
            if (isMounted) openAuthDialog("signin");
          }
          url.searchParams.delete("auth_error");
          window.history.replaceState({}, document.title, url.pathname + (url.search ? `?${url.search}` : ""));
        }
      }

      // Verify with backend
      try {
        const res = await ky.get("/api/auth/me").json<{
          authenticated: boolean;
          user: AuthUser | null;
          token: string | null;
        }>();

        if (isMounted) {
          if (res.authenticated && res.user && res.token) {
            setUser(res.user);
            setToken(res.token);
            try {
              localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
            } catch {
              // Ignore
            }
          } else {
            setUser(null);
            setToken(null);
            try {
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn("Session check failed:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [openAuthDialog]);

  const login = useCallback(
    async (data: { email: string; password: string }) => {
      const res = await ky
        .post("/api/auth/login", { json: data })
        .json<{ success: boolean; user: AuthUser; token: string }>();

      handleAuthSuccess(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name || "Developer"}!`);
    },
    [handleAuthSuccess]
  );

  const signup = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      const res = await ky
        .post("/api/auth/signup", { json: data })
        .json<{ success: boolean; user: AuthUser; token: string }>();

      handleAuthSuccess(res.user, res.token);
      toast.success(`Account created! Welcome to CodePilot, ${res.user.name}!`);
    },
    [handleAuthSuccess]
  );

  const loginWithGoogle = useCallback(
    async (credential?: string) => {
      // Direct credential from Google Identity Services (GIS)
      if (credential) {
        const res = await ky
          .post("/api/auth/google", { json: { credential } })
          .json<{ success: boolean; user: AuthUser; token: string }>();

        handleAuthSuccess(res.user, res.token);
        toast.success(`Signed in with Google as ${res.user.name}`);
        return;
      }

      // Check if Google OAuth is configured
      try {
        const config = await ky
          .get("/api/auth/google/config")
          .json<{ configured: boolean; clientId: string | null }>();

        if (!config.configured) {
          throw new Error(
            "Google OAuth is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local"
          );
        }

        // Redirect to server-side Google OAuth initiator
        window.location.href = "/api/auth/google";
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("Unable to initialize Google Sign-In.");
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    try {
      await ky.post("/api/auth/logout");
    } catch {
      // Ignore
    }
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
    toast.info("Signed out successfully");
  }, []);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }): Promise<string | null> => {
      if (!forceRefreshToken && token) {
        return token;
      }

      try {
        const res = await ky.get("/api/auth/me").json<{
          authenticated: boolean;
          user: AuthUser | null;
          token: string | null;
        }>();

        if (res.authenticated && res.token) {
          setToken(res.token);
          if (res.user) setUser(res.user);
          return res.token;
        }
      } catch {
        // Fall back to existing token
      }

      return token;
    },
    [token]
  );

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isLoaded: !isLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
    openAuthDialog,
    closeAuthDialog,
    isAuthDialogOpen,
    authDialogMode,
    setAuthDialogMode,
    fetchAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUser() {
  const { user, isLoaded, isAuthenticated } = useAuth();
  return {
    user,
    isLoaded,
    isSignedIn: isAuthenticated,
  };
}
