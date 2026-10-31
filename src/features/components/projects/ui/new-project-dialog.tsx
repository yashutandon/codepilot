"use client";

import { useState } from "react";
import ky from "ky";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "../../../../../convex/_generated/dataModel";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewProjectDialog = ({
  open,
  onOpenChange,
}: NewProjectDialogProps) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { projectId } = await ky
        .post("/api/projects/create-with-prompt", {
          json: { prompt: text },
          timeout: 60000,
          credentials: "same-origin",
        })
        .json<{ projectId: Id<"projects"> }>();

      toast.success("Project created!");
      onOpenChange(false);
      setInput("");
      router.push(`/project/${projectId}`);
    } catch (err: any) {
      let errMsg = "Unable to create project. Please try again.";
      try {
        if (err.response) {
          const body = await err.response.json();
          if (body?.error) errMsg = body.error;
        } else if (err.message) {
          errMsg = err.message;
        }
      } catch {}
      console.error("Project creation error:", err);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Describe what you want to build or specify a template to initialize your workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              placeholder="e.g. Next.js dashboard with Tailwind CSS and interactive charts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              rows={4}
              className="resize-none text-xs focus-visible:ring-1"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground text-right">
              Press <kbd className="px-1 py-0.5 rounded bg-muted border text-[11px] font-mono">Ctrl+Enter</kbd> to submit
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
