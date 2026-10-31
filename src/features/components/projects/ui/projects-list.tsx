"use client";

import { useProjectsPartial } from "../hooks/use-projects";
import { Kbd } from "@/components/ui/kbd";
import { Doc } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  Code2Icon,
  Loader2Icon,
  FolderIcon,
  FolderGit2Icon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";

interface ProjectListProps {
  onViewAll: () => void;
  searchQuery?: string;
}

const formatTimestamp = (timestamp: number) => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
    });
  } catch {
    return "recently";
  }
};

const getProjectIcon = (project: Doc<"projects">) => {
  if (project.importStatus === "completed") {
    return <FaGithub className="size-4 text-emerald-400 shrink-0" />;
  }
  if (project.importStatus === "failed") {
    return <AlertCircleIcon className="size-4 text-rose-400 shrink-0" />;
  }
  if (project.importStatus === "importing") {
    return <Loader2Icon className="size-4 text-amber-400 shrink-0 animate-spin" />;
  }

  return <Code2Icon className="size-4 text-primary shrink-0" />;
};

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span className="font-medium flex items-center gap-1.5 text-foreground/80">
          <FolderIcon className="size-3.5 text-muted-foreground" />
          Jump back in
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          {formatTimestamp(data.updateAt)}
        </span>
      </div>

      <Link
        href={`/project/${data._id}`}
        className="group block p-4 rounded-lg bg-card border border-border/80 hover:border-primary/60 hover:bg-muted/40 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-9 rounded-md bg-muted/60 border border-border/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getProjectIcon(data)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs text-foreground truncate">
                  {data.name}
                </h3>
                {data.exportRepoUrl ? (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50 shrink-0">
                    GitHub
                  </span>
                ) : (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50 shrink-0">
                    Local
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {data.exportRepoUrl ? data.exportRepoUrl.replace("https://github.com/", "") : "In-browser workspace environment"}
              </p>
            </div>
          </div>

          <div className="size-8 rounded-md bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:border-primary/50 transition-colors shrink-0">
            <ArrowRightIcon className="size-4" />
          </div>
        </div>
      </Link>
    </div>
  );
};

const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <li>
      <Link
        href={`/project/${data._id}`}
        className="group px-3 py-2.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border/60 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-7 rounded bg-muted/40 border border-border/50 flex items-center justify-center shrink-0">
            {getProjectIcon(data)}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground truncate block">
              {data.name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="font-mono text-[11px]">{formatTimestamp(data.updateAt)}</span>
          <ArrowRightIcon className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </Link>
    </li>
  );
};

export const ProjectList = ({ onViewAll, searchQuery = "" }: ProjectListProps) => {
  const projects = useProjectsPartial(8);

  if (projects === undefined) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin text-primary" />
        <span className="text-xs font-mono">Loading workspaces...</span>
      </div>
    );
  }

  const filteredProjects = searchQuery
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  if (filteredProjects.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-lg p-6 bg-card/50">
        <FolderGit2Icon className="size-8 mx-auto mb-2 text-muted-foreground/60" />
        <p className="font-medium text-foreground text-xs">
          {searchQuery ? "No matching workspaces found." : "No workspaces yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {searchQuery ? "Try a different search query." : "Create a new project or clone from GitHub to get started."}
        </p>
      </div>
    );
  }

  const [mostRecent, ...rest] = filteredProjects;

  return (
    <div className="flex flex-col gap-5 w-full">
      {mostRecent && !searchQuery && <ContinueCard data={mostRecent} />}

      {(rest.length > 0 || searchQuery) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              {searchQuery ? "Search Results" : "Recent Workspaces"}
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
            >
              <span>View all ({filteredProjects.length})</span>
              <Kbd className="bg-card border border-border text-[11px] font-mono text-muted-foreground">
                Ctrl+Shift+K
              </Kbd>
            </button>
          </div>

          <ul className="flex flex-col gap-0.5 bg-card border border-border/80 rounded-lg p-1.5 shadow-xs">
            {(searchQuery ? filteredProjects : rest).map((project) => (
              <ProjectItem key={project._id} data={project} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
