"use client";

import React from "react";
import { useAuth } from "../context";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  className?: string;
}

export function SignInButton({ children, className }: SignInButtonProps) {
  const { openAuthDialog } = useAuth();

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        openAuthDialog("signin");
      },
    });
  }

  return (
    <Button
      size="sm"
      className={
        className ||
        "bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs px-3.5 h-8 rounded-md border border-[#2ea043]/40 cursor-pointer transition-colors"
      }
      onClick={() => openAuthDialog("signin")}
    >
      Sign In
    </Button>
  );
}

export function SignUpButton({ children, className }: SignInButtonProps) {
  const { openAuthDialog } = useAuth();

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        openAuthDialog("signup");
      },
    });
  }

  return (
    <Button
      size="sm"
      className={
        className ||
        "bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs px-3.5 h-8 rounded-md border border-[#2ea043]/40 cursor-pointer transition-colors"
      }
      onClick={() => openAuthDialog("signup")}
    >
      Sign Up
    </Button>
  );
}
