"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { useProject, useRenameProject } from "../hooks/use-projects";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CloudCheckIcon,
  GitBranchIcon,
  LoaderIcon,
  SparklesIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./editor/components/theme-selector";

export const Navbar = ({ projectId }: { projectId: Id<"projects"> }) => {
  const project = useProject(projectId);
  const renameProject = useRenameProject();

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");

  const handleStartRename = () => {
    if (!project) return;
    setName(project.name);
    setIsRenaming(true);
  };

  const handleSubmit = () => {
    if (!project) return;
    setIsRenaming(false);
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return;
    renameProject({ id: projectId, name: trimmedName });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
    }
  };

  return (
    <nav className="h-10 flex justify-between items-center px-3 bg-sidebar border-b border-border/50 select-none shrink-0">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0 text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-accent/50 text-foreground font-semibold flex items-center gap-1.5"
                  asChild
                >
                  <Link href="/">
                    <Image src="/logo.svg" alt="Logo" height={18} width={18} />
                    <span className="font-bold tracking-tight">CodePilot</span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="mx-1 text-border" />

            <BreadcrumbItem>
              {isRenaming ? (
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={handleSubmit}
                  onKeyDown={handleKeyDown}
                  className="text-xs bg-background/80 px-2 py-0.5 rounded border border-emerald-500/50 text-foreground outline-none font-medium max-w-44"
                />
              ) : (
                <BreadcrumbPage
                  onClick={handleStartRename}
                  className="text-xs cursor-pointer hover:text-emerald-400 font-medium max-w-44 truncate px-1 py-0.5 rounded hover:bg-muted/40 transition-colors"
                  title="Click to rename"
                >
                  {project?.name ?? "Loading..."}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Git Branch Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 text-[10px] text-muted-foreground font-mono">
          <GitBranchIcon className="size-2.5 text-emerald-400" />
          <span>main</span>
        </div>

        {/* Sync Status */}
        {project?.importStatus === "importing" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                <LoaderIcon className="size-2.5 animate-spin" />
                <span>Importing...</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Importing GitHub repository</TooltipContent>
          </Tooltip>
        ) : (
          project?.updateAt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-default font-mono">
                  <CloudCheckIcon className="size-3 text-emerald-500" />
                  <span className="hidden md:inline">Saved</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Saved{" "}
                {formatDistanceToNow(project?.updateAt, {
                  addSuffix: true,
                })}
              </TooltipContent>
            </Tooltip>
          )
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Active AI model pill */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted border border-border text-[10px] font-mono text-muted-foreground cursor-help">
              <SparklesIcon className="size-3 text-emerald-400" />
              <span>Groq &bull; Auto-Fallback</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-[11px] max-w-xs">
            Multi-Model Fallback: Groq (Qwen 3.8 27B, GPT-OSS 120B/20B, Compound) &rarr; Gemini &rarr; Hugging Face &rarr; OpenAI
          </TooltipContent>
        </Tooltip>

        <ThemeSelector compact className="h-7 text-[11px]" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7 border border-border/60",
            },
          }}
        />
      </div>
    </nav>
  );
};