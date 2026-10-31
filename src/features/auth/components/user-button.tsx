"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderKanbanIcon,
  TerminalSquareIcon,
  LogOutIcon,
  UserIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

interface UserButtonProps {
  appearance?: {
    elements?: {
      avatarBox?: string;
    };
  };
  className?: string;
}

export function UserButton({ appearance, className }: UserButtonProps) {
  const { user, logout, openAuthDialog } = useAuth();

  if (!user) {
    return (
      <button
        onClick={() => openAuthDialog("signin")}
        className="text-xs font-medium px-2.5 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-white transition-colors cursor-pointer"
      >
        Sign In
      </button>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  const avatarBoxClass = appearance?.elements?.avatarBox || "size-7";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative rounded-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer transition-transform hover:scale-105 ${className || ""}`}
          aria-label="User menu"
        >
          <Avatar className={`${avatarBoxClass} border border-border shadow-xs`}>
            {user.picture ? (
              <AvatarImage src={user.picture} alt={user.name || "User avatar"} />
            ) : null}
            <AvatarFallback className="bg-[#1f242c] text-[11px] font-mono font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-60 bg-[#0d1117] border border-[#30363d] text-foreground p-1.5 shadow-2xl rounded-lg"
      >
        {/* User Card Header */}
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 border border-[#30363d]">
              {user.picture ? (
                <AvatarImage src={user.picture} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-[#161b22] text-xs font-mono font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                {user.name}
              </span>
              <span className="text-[11px] font-mono text-[#8b949e] truncate">
                {user.email}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-[#8b949e] bg-[#161b22] px-2 py-0.5 rounded border border-[#30363d]/60">
            <ShieldCheckIcon className="size-3 text-[#3fb950]" />
            <span className="capitalize">{user.provider || "Standard"} Session</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#30363d]" />

        {/* Quick Nav Items */}
        <DropdownMenuItem asChild className="focus:bg-[#161b22] focus:text-white cursor-pointer rounded text-xs py-1.5 px-2">
          <Link href="/" className="flex items-center gap-2">
            <FolderKanbanIcon className="size-3.5 text-[#58a6ff]" />
            <span>Workspaces</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="focus:bg-[#161b22] focus:text-white cursor-pointer rounded text-xs py-1.5 px-2">
          <Link href="/playground" className="flex items-center gap-2">
            <TerminalSquareIcon className="size-3.5 text-violet-400" />
            <span>Code Playground</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="focus:bg-[#161b22] focus:text-white cursor-pointer rounded text-xs py-1.5 px-2">
          <a
            href="https://github.com/yashutandon/codepilot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <FaGithub className="size-3.5 text-[#8b949e]" />
              <span>GitHub Repo</span>
            </div>
            <ExternalLinkIcon className="size-3 text-[#8b949e]" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#30363d]" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={() => logout()}
          className="focus:bg-rose-500/10 focus:text-rose-400 text-rose-400 cursor-pointer rounded text-xs py-1.5 px-2 flex items-center gap-2"
        >
          <LogOutIcon className="size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

