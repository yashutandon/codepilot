import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useEditor } from "../hooks/use-editor";
import { useFile } from "../../../hooks/use-files";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";

const Tab = ({
  fileId,
  isFirst,
  projectId,
}: {
  fileId: Id<"files">;
  isFirst: boolean;
  projectId: Id<"projects">;
}) => {
  const file = useFile(fileId);
  const {
    activeTabId,
    previewTabId,
    setActiveTab,
    openFile,
    closeTab,
  } = useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const displayName = file?.name
    ? file.name.replace(/^\/?(app|root|workspace)\//i, "").split("/").pop() || file.name
    : "Loading...";

  return (
    <div
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-9 px-3 cursor-pointer text-muted-foreground group border-r border-border hover:bg-[#27272a] transition-colors select-none text-xs",
        isActive
          ? "bg-background text-foreground border-t-2 border-t-primary font-medium"
          : "bg-sidebar",
        isFirst && "border-l border-border"
      )}
    >
      {file === undefined ? (
        <Spinner className="size-3 text-muted-foreground" />
      ) : (
        <FileIcon fileName={displayName} autoAssign className="size-3.5 shrink-0" />
      )}
      <span
        className={cn(
          "whitespace-nowrap font-mono text-xs",
          isPreview && "italic opacity-85"
        )}
      >
        {displayName}
      </span>
      <button
        type="button"
        title="Close tab (Ctrl+W)"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeTab(fileId);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId);
          }
        }}
        className={cn(
          "size-4 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1",
          isActive && "opacity-80"
        )}
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );
};

export const TopNavigation = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const { openTabs } = useEditor(projectId);

  return (
    <ScrollArea className="flex-1 w-full">
      <nav className="bg-sidebar flex items-center h-9 border-b border-border/70 overflow-x-auto">
        {openTabs.map((fileId, index) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            projectId={projectId}
          />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
