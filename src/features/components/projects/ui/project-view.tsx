"use client";

import { Kbd } from "@/components/ui/kbd";
import { Plus, SearchIcon, TerminalSquareIcon, CommandIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { ProjectList } from "./projects-list";
import { useEffect, useState } from "react";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { ImportGithubDialog } from "./import-github-dialog";
import { NewProjectDialog } from "./new-project-dialog";
import { UserButton } from "@/features/auth";
import { ThemeSelector } from "./editor/components/theme-selector";

export const ProjectView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyK") {
        e.preventDefault();
        setCommandDialogOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyI") {
        e.preventDefault();
        setImportDialogOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyJ") {
        e.preventDefault();
        setNewProjectDialogOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <ImportGithubDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors duration-200">
        {/* IDE Top Navigation Bar */}
        <header className="h-12 px-5 flex items-center justify-between border-b border-border/80 bg-sidebar/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="size-7 rounded-md bg-card border border-border flex items-center justify-center p-1 group-hover:border-primary/50 transition-colors">
                <Image src="/logo.svg" alt="CodePilot" width={18} height={18} priority />
              </div>
              <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                CodePilot
              </span>
            </Link>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
              Workspace Hub
            </span>
          </div>

          {/* Center search trigger button */}
          <button
            type="button"
            onClick={() => setCommandDialogOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 hover:bg-muted/80 border border-border/60 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
          >
            <SearchIcon className="size-3.5" />
            <span>Search workspaces...</span>
            <Kbd className="bg-background border border-border text-[11px] font-mono ml-2">
              Ctrl+Shift+K
            </Kbd>
          </button>

          {/* Right utility actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/playground"
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-2.5 py-1.5 rounded-md hover:bg-muted/60 transition-colors flex items-center gap-1.5"
            >
              <TerminalSquareIcon className="size-3.5 text-violet-400" />
              <span className="hidden md:inline">Playground</span>
            </Link>

            <ThemeSelector compact className="h-8 text-xs" />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-7 border border-border",
                },
              }}
            />
          </div>
        </header>

        {/* Central Dashboard Hub */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-2xl mx-auto w-full">
          <div className="w-full flex flex-col gap-6 items-center">
            {/* Header Titles */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Workspaces
              </h1>
              <p className="text-sm text-muted-foreground">
                Select an existing project or initialize a new browser workspace.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {/* New Project */}
              <button
                type="button"
                onClick={() => setNewProjectDialogOpen(true)}
                className="group p-4 rounded-lg bg-card border border-border hover:border-primary/60 hover:bg-muted/40 text-left transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="size-7 rounded bg-muted/60 border border-border/80 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Plus className="size-4" />
                  </div>
                  <Kbd className="bg-background border border-border text-[11px] font-mono text-muted-foreground">
                    Ctrl+Shift+J
                  </Kbd>
                </div>
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    New Project
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Create a blank project
                  </span>
                </div>
              </button>

              {/* Import GitHub */}
              <button
                type="button"
                onClick={() => setImportDialogOpen(true)}
                className="group p-4 rounded-lg bg-card border border-border hover:border-emerald-500/60 hover:bg-muted/40 text-left transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="size-7 rounded bg-muted/60 border border-border/80 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <FaGithub className="size-3.5" />
                  </div>
                  <Kbd className="bg-background border border-border text-[11px] font-mono text-muted-foreground">
                    Ctrl+Shift+I
                  </Kbd>
                </div>
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    Import GitHub
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Clone from repository
                  </span>
                </div>
              </button>

              {/* Polyglot Playground */}
              <Link
                href="/playground"
                className="group p-4 rounded-lg bg-card border border-border hover:border-violet-500/60 hover:bg-muted/40 text-left transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="size-7 rounded bg-muted/60 border border-border/80 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                    <TerminalSquareIcon className="size-3.5" />
                  </div>
                  <Kbd className="bg-background border border-border text-[11px] font-mono text-muted-foreground">
                    Playground
                  </Kbd>
                </div>
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    Code Playground
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Run C, C++, Java, Rust
                  </span>
                </div>
              </Link>
            </div>

            {/* Quick Filter Input */}
            <div className="w-full relative">
              <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter workspaces by name..."
                className="w-full bg-card border border-border rounded-lg pl-8.5 pr-14 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/80 transition-colors font-sans"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer font-mono"
                >
                  Clear
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                  <CommandIcon className="size-2.5" />
                  <span>K</span>
                </div>
              )}
            </div>

            {/* Workspaces List Section */}
            <div className="w-full">
              <ProjectList
                onViewAll={() => setCommandDialogOpen(true)}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </main>

        {/* Minimal Developer Keybindings Footer */}
        <footer className="h-9 px-5 border-t border-border/80 bg-sidebar/50 text-[11px] text-muted-foreground font-mono flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <span className="text-foreground font-medium">CodePilot IDE</span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline">WebContainer Runtime</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Ctrl+Shift+J: New</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="hidden md:inline">Ctrl+Shift+I: Import</span>
            <span className="hidden md:inline">&bull;</span>
            <span>Ctrl+Shift+K: Command Palette</span>
          </div>
        </footer>
      </div>
    </>
  );
};
