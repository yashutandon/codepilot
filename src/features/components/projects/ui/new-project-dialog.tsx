"use client";

import {  useState } from "react";
import ky from "ky";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

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

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = (message.text || input).trim();
    if (!text) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-lg p-0"
      >
        <DialogHeader className="hidden">
          <DialogTitle>What do you want to build?</DialogTitle>
          <DialogDescription>
            Describe your project and AI will help you create it.
          </DialogDescription>
        </DialogHeader>
        <PromptInput onSubmit={handleSubmit} className="border-none!">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask Codepilot to build..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={isSubmitting}
            />
          </PromptInputBody>
          <PromptInputFooter>
             <PromptInputTools />
             <PromptInputSubmit disabled={!input || isSubmitting} />
          </PromptInputFooter>
        </PromptInput>
      </DialogContent>
    </Dialog>
  );
};