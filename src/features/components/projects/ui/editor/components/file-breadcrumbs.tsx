import { FileIcon } from "@react-symbols/icons/utils";
import { useFilePath } from "../../../hooks/use-files";
import { useEditor } from "../hooks/use-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import React from "react";

export const FileBreadcrumbs = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  if (filePath === undefined || !activeTabId) {
    return <div className="h-7 bg-background border-b border-border/50" />;
  }

  return (
    <div className="h-7 px-3 bg-background border-b border-border/50 flex items-center select-none">
      <Breadcrumb>
        <BreadcrumbList className="gap-1 text-xs font-mono">
          {filePath.map((item, index) => {
            const isLast = index === filePath.length - 1;
            return (
              <React.Fragment key={item._id}>
                <BreadcrumbItem className="text-xs">
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1.5 font-medium text-foreground">
                      <FileIcon
                        className="size-3.5 shrink-0"
                        autoAssign
                        fileName={item.name}
                      />
                      <span>{item.name}</span>
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
                      {item.name}
                    </span>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="text-muted-foreground/40 text-[11px]">
                    /
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
