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
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5">
        <span className="font-medium flex items-center gap-1.5">
          <FolderIcon className="size-3 text-muted-foreground" />
          Last active
        </span>
        <span className="text-[11px] font-mono">{formatTimestamp(data.updateAt)}</span>
      </div>

      <Link
        href={`/project/${data._id}`}
        className="group block p-3.5 rounded-lg bg-card border border-border hover:border-primary/60 hover:bg-muted/60 transition-all shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded bg-muted border border-border flex items-center justify-center shrink-0">
              {getProjectIcon(data)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-foreground truncate">
                {data.name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {data.exportRepoUrl ? "Linked to GitHub" : "Local cloud workspace"}
              </p>
            </div>
          </div>
          <div className="size-7 rounded bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
            <ArrowRightIcon className="size-3.5" />
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
        className="group px-3 py-2 rounded-md hover:bg-muted/60 border border-transparent hover:border-border flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {getProjectIcon(data)}
          <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground truncate">
            {data.name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
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
      <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin text-emerald-400" />
        <span className="text-xs font-mono">Loading...</span>
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
      <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg p-5 bg-card">
        {searchQuery ? "No matching projects." : "No projects yet. Create or import one above."}
      </div>
    );
  }

  const [mostRecent, ...rest] = filteredProjects;

  return (
    <div className="flex flex-col gap-4 w-full">
      {mostRecent && !searchQuery && <ContinueCard data={mostRecent} />}

      {(rest.length > 0 || searchQuery) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {searchQuery ? "Search Results" : "Recent Projects"}
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
            >
              <span>View all</span>
              <Kbd className="bg-card border border-border text-[10px] text-muted-foreground">Ctrl+Shift+K</Kbd>
            </button>
          </div>

          <ul className="flex flex-col gap-0.5 bg-card border border-border rounded-lg p-1.5 shadow-xs">
            {(searchQuery ? filteredProjects : rest).map((project) => (
              <ProjectItem key={project._id} data={project} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};