"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { HTTPError } from "ky";
import ky from "ky";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context";
import {
  LoaderIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  HelpCircleIcon,
  KeyRoundIcon,
} from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export function AuthDialog() {
  const {
    isAuthDialogOpen,
    closeAuthDialog,
    authDialogMode,
    setAuthDialogMode,
    login,
    signup,
    loginWithGoogle,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGoogleSetupGuide, setShowGoogleSetupGuide] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  const [googleConfig, setGoogleConfig] = useState<{
    configured: boolean;
    clientId: string | null;
  } | null>(null);

  const gisInitializedRef = useRef(false);

  // Check Google OAuth configuration and initialize GIS if available
  useEffect(() => {
    let isMounted = true;

    async function loadGoogleConfig() {
      try {
        const config = await ky
          .get("/api/auth/google/config")
          .json<{ configured: boolean; clientId: string | null }>();

        if (!isMounted) return;
        setGoogleConfig(config);

        if (config.configured && config.clientId && !gisInitializedRef.current) {
          // Load GIS script if not already present
          if (!document.getElementById("google-gsi-client")) {
            const script = document.createElement("script");
            script.id = "google-gsi-client";
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => {
              if (window.google?.accounts?.id && config.clientId) {
                window.google.accounts.id.initialize({
                  client_id: config.clientId,
                  callback: async (response) => {
                    if (response.credential) {
                      setIsLoading(true);
                      try {
                        await loginWithGoogle(response.credential);
                      } catch (err) {
                        setErrorMessage(
                          err instanceof Error ? err.message : "Google sign-in failed."
                        );
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  },
                  auto_select: false,
                  cancel_on_tap_outside: true,
                });
                gisInitializedRef.current = true;
              }
            };
            document.head.appendChild(script);
          } else if (window.google?.accounts?.id && config.clientId) {
            window.google.accounts.id.initialize({
              client_id: config.clientId,
              callback: async (response) => {
                if (response.credential) {
                  setIsLoading(true);
                  try {
                    await loginWithGoogle(response.credential);
                  } catch (err) {
                    setErrorMessage(
                      err instanceof Error ? err.message : "Google sign-in failed."
                    );
                  } finally {
                    setIsLoading(false);
                  }
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            gisInitializedRef.current = true;
          }
        }
      } catch {
        // Ignore config check error
      }
    }

    loadGoogleConfig();

    return () => {
      isMounted = false;
    };
  }, [loginWithGoogle]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setErrorMessage(null);
    setShowGoogleSetupGuide(false);
  };

  const handleModeChange = (mode: "signin" | "signup") => {
    setErrorMessage(null);
    setShowGoogleSetupGuide(false);
    setAuthDialogMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowGoogleSetupGuide(false);
    setIsLoading(true);

    try {
      if (authDialogMode === "signin") {
        await login({ email, password });
      } else {
        if (!name.trim()) {
          setErrorMessage("Please enter your name");
          setIsLoading(false);
          return;
        }
        await signup({ name, email, password });
      }
      resetForm();
    } catch (err) {
      if (err instanceof HTTPError) {
        try {
          const data = await err.response.json<{ error?: string }>();
          if (data.error?.toLowerCase().includes("invalid email or password")) {
            setErrorMessage(
              "Invalid email or password. If you don't have an account yet, click 'Register' above."
            );
          } else {
            setErrorMessage(
              data.error || "Authentication failed. Please check your credentials."
            );
          }
        } catch {
          setErrorMessage("Authentication failed. Please try again.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // If Google Identity Services is available and ready, attempt popup/prompt
      if (window.google?.accounts?.id && googleConfig?.clientId) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            // Fallback to server redirect flow if prompt is blocked/skipped
            window.location.href = "/api/auth/google";
          }
        });
        setIsLoading(false);
        return;
      }

      // Check if configured; if not, show clear instructions
      if (googleConfig && !googleConfig.configured) {
        setShowGoogleSetupGuide(true);
        setIsLoading(false);
        return;
      }

      // Standard server-side redirect to Google OAuth
      await loginWithGoogle();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("not configured")) {
          setShowGoogleSetupGuide(true);
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage("Failed to initiate Google sign-in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCallbackUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/auth/google/callback`;
    }
    return "http://localhost:3000/api/auth/google/callback";
  };

  const copyCallbackUrl = () => {
    const url = getCallbackUrl();
    navigator.clipboard.writeText(url);
    setCopiedUri(true);
    toast.success("Callback URL copied to clipboard!");
    setTimeout(() => setCopiedUri(false), 2500);
  };

  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={(open) => !open && closeAuthDialog()}>
      <DialogContent className="sm:max-w-[420px] bg-[#0d1117] border border-[#30363d] text-foreground p-0 overflow-hidden shadow-2xl rounded-xl">
        {/* Header Tabs */}
        <div className="bg-[#161b22] border-b border-[#30363d] p-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center p-1.5 shadow-xs">
                <Image src="/logo.svg" alt="CodePilot" width={18} height={18} priority />
              </div>
              <DialogTitle className="text-base font-semibold text-white tracking-tight">
                CodePilot Account
              </DialogTitle>
            </div>
            <div className="flex items-center rounded-lg bg-[#0d1117] p-0.5 border border-[#30363d]">
              <button
                type="button"
                onClick={() => handleModeChange("signin")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  authDialogMode === "signin"
                    ? "bg-[#238636] text-white shadow-xs"
                    : "text-[#8b949e] hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  authDialogMode === "signup"
                    ? "bg-[#238636] text-white shadow-xs"
                    : "text-[#8b949e] hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          </div>
          <DialogDescription className="text-xs text-[#8b949e]">
            {authDialogMode === "signin"
              ? "Sign in to access your projects, files, and browser IDE workspace."
              : "Create an account to run Node.js in the browser and sync with GitHub."}
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircleIcon className="size-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Google OAuth Configuration Guide Banner */}
          {showGoogleSetupGuide && (
            <div className="p-3.5 rounded-lg bg-[#161b22] border border-amber-500/40 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <KeyRoundIcon className="size-4 text-amber-400 shrink-0" />
                <span>Google OAuth Credentials Setup</span>
              </div>
              <p className="text-[11px] text-[#8b949e] leading-relaxed">
                To sign in with Google, add your Google Cloud OAuth Client credentials to{" "}
                <code className="text-amber-200/90 font-mono bg-[#0d1117] px-1 py-0.5 rounded border border-[#30363d]">
                  .env.local
                </code>
                :
              </p>
              <div className="space-y-1.5 font-mono text-[10px] bg-[#0d1117] p-2 rounded border border-[#30363d] text-[#c9d1d9]">
                <div>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
                <div>GOOGLE_CLIENT_SECRET=your_client_secret</div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-[#8b949e] font-mono truncate">
                  URI: {getCallbackUrl()}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={copyCallbackUrl}
                  className="h-6 px-2 text-[10px] bg-[#21262d] border-[#30363d] text-white hover:bg-[#30363d] shrink-0 flex items-center gap-1"
                >
                  {copiedUri ? (
                    <>
                      <CheckIcon className="size-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3" />
                      <span>Copy URI</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Google Sign In Button (Primary OAuth Provider) */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#161b22] hover:bg-[#21262d] text-white border-[#30363d] h-10 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderIcon className="size-4 animate-spin text-[#8b949e]" />
            ) : (
              <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#30363d] w-full" />
            <span className="bg-[#0d1117] px-2.5 text-[11px] text-[#8b949e] font-mono uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {authDialogMode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name" className="text-xs text-[#c9d1d9] font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 size-3.5 text-[#8b949e]" />
                  <Input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Linus Torvalds"
                    className="pl-8 bg-[#161b22] border-[#30363d] text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-[#58a6ff]"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs text-[#c9d1d9] font-medium">
                Email Address
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-2.5 top-2.5 size-3.5 text-[#8b949e]" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="pl-8 bg-[#161b22] border-[#30363d] text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-[#58a6ff]"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs text-[#c9d1d9] font-medium">
                Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-2.5 top-2.5 size-3.5 text-[#8b949e]" />
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-8 bg-[#161b22] border-[#30363d] text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-[#58a6ff]"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold h-9 mt-1 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <LoaderIcon className="size-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : authDialogMode === "signin" ? (
                "Sign In with Email"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Mode Switcher Footer */}
          <div className="text-center pt-1">
            {authDialogMode === "signin" ? (
              <p className="text-xs text-[#8b949e]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className="text-[#58a6ff] hover:underline font-medium cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#8b949e]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("signin")}
                  className="text-[#58a6ff] hover:underline font-medium cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
