"use client";

import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertCircleIcon,
  GlobeIcon,
  Loader2Icon,
  ArrowRightIcon,
  FolderGit2Icon,
  FolderIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../hooks/use-projects";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { Kbd } from "@/components/ui/kbd";

interface ProjectsCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed" || project.exportRepoUrl) {
    return <FaGithub className="size-3.5 text-emerald-400 shrink-0" />;
  }
  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-3.5 text-rose-400 shrink-0" />;
  }
  if (project.importStatus === "importing") {
    return <Loader2Icon className="size-3.5 text-amber-400 shrink-0 animate-spin" />;
  }

  return <GlobeIcon className="size-3.5 text-primary shrink-0" />;
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return "recently";
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
    });
  } catch {
    return "recently";
  }
};

export const ProjectsCommandDialog = ({
  open,
  onOpenChange,
}: ProjectsCommandDialogProps) => {
  const router = useRouter();
  const projects = useProjects();

  const handleSelect = (projectId: string) => {
    router.push(`/project/${projectId}`);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search and navigate directly to your workspace projects"
      className="sm:max-w-xl bg-[#0d1117] border border-[#30363d] shadow-2xl rounded-xl"
    >
      <CommandInput placeholder="Search workspaces by name..." />
      <CommandList className="max-h-[380px] overflow-y-auto p-1.5 scrollbar-thin">
        <CommandEmpty className="py-12 flex flex-col items-center justify-center gap-2 text-center text-xs text-[#8b949e]">
          <FolderIcon className="size-8 text-[#30363d] stroke-[1.5]" />
          <span>No matching workspaces found.</span>
        </CommandEmpty>
        <CommandGroup heading={`Workspaces (${projects?.length || 0})`}>
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              value={`${project.name} ${project._id}`}
              onSelect={() => handleSelect(project._id)}
              className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-[#161b22] data-[selected=true]:bg-[#161b22] text-[#c9d1d9] data-[selected=true]:text-white cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-6 rounded bg-[#21262d] border border-[#30363d] flex items-center justify-center shrink-0 group-hover:border-[#58a6ff]/50 transition-colors">
                  {getProjectIcon(project)}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-xs truncate text-white">
                    {project.name}
                  </span>
                  {project.exportRepoUrl ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b22] text-emerald-400 border border-emerald-500/30 shrink-0">
                      GitHub
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b22] text-[#8b949e] border border-[#30363d] shrink-0">
                      Local
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8b949e] shrink-0">
                <span className="text-[11px] font-mono hidden sm:inline">
                  {formatTimestamp(project.updateAt)}
                </span>
                <div className="size-5 rounded flex items-center justify-center text-[#8b949e] group-hover:text-white transition-colors">
                  <ArrowRightIcon className="size-3.5" />
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      {/* Command Palette Keyboard Hints Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#30363d] bg-[#161b22]/50 text-[11px] text-[#8b949e] font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Kbd className="bg-[#0d1117] border border-[#30363d] text-[10px] px-1 py-0.5 rounded">↑</Kbd>
            <Kbd className="bg-[#0d1117] border border-[#30363d] text-[10px] px-1 py-0.5 rounded">↓</Kbd>
            <span className="text-[10px] ml-1">Navigate</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Kbd className="bg-[#0d1117] border border-[#30363d] text-[10px] px-1 py-0.5 rounded">↵</Kbd>
            <span className="text-[10px] ml-1">Open</span>
          </span>
        </div>
        <Kbd className="bg-[#0d1117] border border-[#30363d] text-[10px] px-1.5 py-0.5 rounded text-[#8b949e]">
          ESC
        </Kbd>
      </div>
    </CommandDialog>
  );
};
