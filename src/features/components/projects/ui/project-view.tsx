"use client";

import { Kbd } from "@/components/ui/kbd";
import { Plus, SearchIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { ProjectList } from "./projects-list";
import { useEffect, useState } from "react";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { ImportGithubDialog } from "./import-github-dialog";
import { NewProjectDialog } from "./new-project-dialog";
import { UserButton } from "@clerk/nextjs";
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

      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between select-none transition-colors duration-200">
        {/* Dashboard Top Header */}
        <header className="px-6 py-3.5 flex items-center justify-between border-b border-border bg-sidebar transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-card border border-border flex items-center justify-center">
              <Image src="/logo.svg" alt="CodePilot" width={18} height={18} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
              CodePilot
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
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
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-xl mx-auto w-full">
          <div className="w-full flex flex-col gap-5 items-center">
            {/* Title */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono border border-border mb-1">
                <SparklesIcon className="size-3 text-emerald-400" />
                <span>AI Developer Workspace</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Workspaces
              </h1>
              <p className="text-xs text-muted-foreground">
                Select an existing project or initialize a new workspace.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => setNewProjectDialogOpen(true)}
                className="group p-3.5 rounded-lg bg-card border border-border hover:border-primary/60 hover:bg-muted/60 text-left transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="size-7 rounded bg-muted border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Plus className="size-4" />
                  </div>
                  <Kbd className="bg-background border border-border text-[10px] text-muted-foreground">
                    Ctrl+Shift+J
                  </Kbd>
                </div>
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    New Project
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Create a blank project
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setImportDialogOpen(true)}
                className="group p-3.5 rounded-lg bg-card border border-border hover:border-emerald-500/60 hover:bg-muted/60 text-left transition-all flex flex-col justify-between gap-3 shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="size-7 rounded bg-muted border border-border flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <FaGithub className="size-3.5" />
                  </div>
                  <Kbd className="bg-background border border-border text-[10px] text-muted-foreground">
                    Ctrl+Shift+I
                  </Kbd>
                </div>
                <div>
                  <span className="font-semibold text-xs text-foreground block">
                    Import GitHub
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Clone from repository
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Search Filter */}
            <div className="w-full relative">
              <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-card border border-border rounded-lg pl-8 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Project List */}
            <div className="w-full">
              <ProjectList
                onViewAll={() => setCommandDialogOpen(true)}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-3 text-center text-[11px] text-muted-foreground border-t border-border font-mono transition-colors">
          CodePilot &bull;
        </footer>
      </div>
    </>
  );
};