"use client";

import React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./theme-provider";
import { ThemeSync } from "./theme-sync";
import { UnauthView } from "@/features/components/unauth-view";
import AuthLoader from "@/features/components/auth-loader";
import { AuthProvider, useAuth, AuthDialog } from "@/features/auth";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <UnauthView />
        <AuthDialog />
      </>
    );
  }

  return (
    <>
      <ThemeSync />
      {children}
      <AuthDialog />
    </>
  );
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppContent>{children}</AppContent>
        </ThemeProvider>
      </ConvexProvider>
    </AuthProvider>
  );
};
