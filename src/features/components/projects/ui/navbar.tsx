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
import { UserButton } from "@/features/auth";
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
  PencilIcon,
  TerminalSquareIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
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
    <nav className="h-10 flex justify-between items-center px-3 bg-sidebar border-b border-border/80 select-none shrink-0 transition-colors">
      <div className="flex items-center gap-x-2.5 min-w-0">
        <Breadcrumb>
          <BreadcrumbList className="gap-0 text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-accent/60 text-foreground font-semibold flex items-center gap-1.5"
                  asChild
                >
                  <Link href="/">
                    <Image src="/logo.svg" alt="CodePilot" height={18} width={18} priority />
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
                  className="text-xs bg-background px-2 py-0.5 rounded border border-primary/70 text-foreground outline-none font-medium max-w-52 shadow-xs"
                />
              ) : (
                <BreadcrumbPage
                  onClick={handleStartRename}
                  className="text-xs group/rename cursor-pointer hover:text-foreground font-medium max-w-48 truncate px-1.5 py-0.5 rounded hover:bg-muted/60 transition-colors flex items-center gap-1"
                  title="Click to rename workspace"
                >
                  <span className="truncate">{project?.name ?? "Loading..."}</span>
                  <PencilIcon className="size-2.5 opacity-0 group-hover/rename:opacity-60 transition-opacity" />
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Git Branch Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#27272a] border border-border text-[11px] text-muted-foreground font-mono">
          <GitBranchIcon className="size-2.5 text-emerald-400" />
          <span>main</span>
        </div>

        {/* Connected GitHub Repo Link */}
        {project?.exportRepoUrl && (
          <a
            href={project.exportRepoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-muted/40 hover:bg-muted border border-border/50 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            title="Open GitHub Repository"
          >
            <FaGithub className="size-3" />
            <span className="max-w-[120px] truncate">{project.exportRepoUrl.replace("https://github.com/", "")}</span>
            <ExternalLinkIcon className="size-2.5 opacity-70" />
          </a>
        )}

        {/* Sync Status */}
        {project?.importStatus === "importing" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
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
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-default font-mono">
                  <CloudCheckIcon className="size-3 text-emerald-500" />
                  <span className="hidden lg:inline">Saved</span>
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
      <div className="flex items-center gap-2">
        <Link
          href="/playground"
          className="text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded hover:bg-muted/60 transition-colors flex items-center gap-1.5"
          title="Open Polyglot Code Playground"
        >
          <TerminalSquareIcon className="size-3.5 text-violet-400" />
          <span className="hidden sm:inline">Playground</span>
        </Link>

        <ThemeSelector compact className="h-7 text-[11px]" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7 border border-border/80",
            },
          }}
        />
      </div>
    </nav>
  );
};
