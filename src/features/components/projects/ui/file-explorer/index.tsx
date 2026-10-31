import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, CopyMinus, FilePlus2Icon, FolderPlusIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { useProject } from '../../hooks/use-projects'
import { Button } from '@/components/ui/button'
import { useCreateFile, useCreateFolder, useFolderContents } from '../../hooks/use-files'
import { CreateInput } from './create-input'
import { LoadingRow } from './loading-row'
import { Tree } from './tree'

const FileExplorer = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const project = useProject(projectId);
  const rootFiles = useFolderContents({
    projectId,
    enabled: isOpen
  });

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: undefined
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: undefined
      });
    }
  };

  return (
    <div className='h-full flex flex-col bg-sidebar border-r border-border/70 select-none'>
      {/* Explorer Section Header */}
      <div
        role='button'
        onClick={() => setIsOpen((value) => !value)}
        className='group/project cursor-pointer w-full text-left flex items-center justify-between h-8 px-2.5 bg-sidebar border-b border-border/60 hover:bg-muted/40 transition-colors shrink-0'
      >
        <div className='flex items-center gap-1.5 min-w-0'>
          <ChevronRightIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-90"
            )}
          />
          <span className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate font-mono'>
            {project?.name ?? "Explorer"}
          </span>
        </div>

        <div className='opacity-0 group-hover/project:opacity-100 flex items-center gap-0.5 ml-auto transition-opacity'>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(true);
              setCreating("file");
            }}
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground hover:text-foreground"
            title="New File"
          >
            <FilePlus2Icon className='size-3.5' />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(true);
              setCreating("folder");
            }}
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground hover:text-foreground"
            title="New Folder"
          >
            <FolderPlusIcon className='size-3.5' />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCollapseKey((prev) => prev + 1);
              setIsOpen(false);
            }}
            variant="ghost"
            size="icon-xs"
            className="size-6 text-muted-foreground hover:text-foreground"
            title="Collapse All"
          >
            <CopyMinus className='size-3.5' />
          </Button>
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          {isOpen && (
            <div className="py-1">
              {rootFiles === undefined && <LoadingRow level={0} />}
              {creating && (
                <CreateInput
                  type={creating}
                  level={0}
                  onSubmit={handleCreate}
                  onCancel={() => setCreating(null)}
                />
              )}
              {rootFiles?.map((item) => (
                <Tree
                  key={`${item._id}-${collapseKey}`}
                  item={item}
                  level={0}
                  projectId={projectId}
                />
              ))}
              {rootFiles && rootFiles.length === 0 && !creating && (
                <div className="p-4 text-center text-xs text-muted-foreground/70">
                  <p>No files in workspace</p>
                  <p className="text-[11px] mt-1 text-muted-foreground/50">
                    Click + above to create a file
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default FileExplorer;
