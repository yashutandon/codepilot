export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider?: "google" | "credentials";
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: (credential?: string) => Promise<void>;
  logout: () => Promise<void>;
  openAuthDialog: (mode?: "signin" | "signup") => void;
  closeAuthDialog: () => void;
  isAuthDialogOpen: boolean;
  authDialogMode: "signin" | "signup";
  setAuthDialogMode: (mode: "signin" | "signup") => void;
  fetchAccessToken: (args: { forceRefreshToken: boolean }) => Promise<string | null>;
}
