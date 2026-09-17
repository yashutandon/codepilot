"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import { Id } from "../../../../../convex/_generated/dataModel";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  CopyIcon,
  HistoryIcon,
  LoaderIcon,
  PlusIcon,
  SparklesIcon,
  Wand2Icon,
} from "lucide-react";
import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversation";
import { DEFAULT_CONVERSATION_TITLE } from "../../../../../convex/constants";
import { PastConversationsDialog } from "./past-conversation-dialog";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
}

const STARTER_PROMPTS = [
  "Explain this project architecture & file structure",
  "Refactor components for performance & clean code",
  "Add interactive UI elements with Tailwind CSS",
  "Audit for bugs and suggest automated tests",
];

export const ConversationSidebar = ({ projectId }: ConversationSidebarProps) => {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [pastConversationsOpen, setPastConversationOpen] = useState(false);

  const conversations = useConversations(projectId);
  const createConversation = useCreateConversation();
  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;
  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing"
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = (message.text || input).trim();
    if (!text) {
      if (isProcessing) {
        await handleCancel();
      }
      return;
    }

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: text,
        },
        timeout: 60000,
      });
    } catch {
      toast.error("Message failed to send");
    }
    setInput("");
  };

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: { projectId },
        timeout: 10000,
      });
      toast.info("Request cancelled");
    } catch {
      toast.error("Unable to cancel request");
    }
  };

  const handlePromptPillClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      <PastConversationsDialog
        projectId={projectId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full bg-sidebar border-l border-border select-none">
        {/* Sidebar Header */}
        <div className="h-9 flex items-center justify-between px-3 border-b border-border shrink-0 bg-sidebar">
          <div className="flex items-center gap-2 min-w-0">
            <SparklesIcon className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-foreground truncate">
              {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isProcessing && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                title="Cancel current request"
              >
                Stop
              </Button>
            )}
            <Button
              size="icon-xs"
              variant="ghost"
              className="size-6 text-muted-foreground hover:text-foreground"
              title="Conversation history"
              onClick={() => setPastConversationOpen(true)}
            >
              <HistoryIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              className="size-6 text-muted-foreground hover:text-foreground"
              title="New conversation"
              onClick={handleCreateConversation}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Conversation Stream */}
        <Conversation className="flex-1 overflow-y-auto">
          <ConversationContent className="p-3 space-y-4">
            {(!conversationMessages || conversationMessages.length === 0) && (
              <div className="py-8 flex flex-col items-center text-center px-2">
                <div className="size-10 rounded-lg bg-card border border-border flex items-center justify-center text-foreground mb-3">
                  <Wand2Icon className="size-5 text-muted-foreground" />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1">
                  CodePilot Assistant
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mb-4">
                  Ask questions, generate components, or execute multi-file edits across your project.
                </p>

                {/* Starter suggestions */}
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider text-left pl-1">
                    Suggested prompts
                  </span>
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptPillClick(prompt)}
                      className="text-left text-[11px] p-2 rounded-md bg-card hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-colors font-sans leading-snug"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {conversationMessages?.map((message, messageIndex) => (
              <Message key={message._id} from={message.role}>
                <MessageContent>
                  {message.status === "processing" ? (
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded-md border border-border">
                      <div className="flex items-center gap-2">
                        <LoaderIcon className="size-3.5 animate-spin text-emerald-400" />
                        <span>AI is thinking (Auto-Fallback)...</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                        onClick={handleCancel}
                        title="Click to cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-xs text-muted-foreground italic">
                      Request cancelled
                    </span>
                  ) : (
                    <MessageResponse className="text-xs leading-relaxed">
                      {message.content}
                    </MessageResponse>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "completed" &&
                  messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                    <MessageActions>
                      <MessageAction
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          toast.success("Copied to clipboard");
                        }}
                        label="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </MessageAction>
                    </MessageActions>
                  )}
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Bar */}
        <div className="p-2.5 border-t border-border bg-sidebar">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-lg border border-border bg-background transition-colors"
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder={
                  isProcessing
                    ? "Type your next instruction or click Stop..."
                    : "Ask CodePilot anything... (Enter to send)"
                }
                onChange={(e) => {
                  setInput(e.target.value);
                }}
                value={input}
                className="text-xs text-foreground placeholder:text-muted-foreground/60 min-h-[48px]"
              />
            </PromptInputBody>
            <PromptInputFooter className="px-2 pb-1.5 pt-0">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono" title="Groq -> Gemini -> Hugging Face -> OpenAI">
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Auto-Fallback Active</span>
              </div>
              <PromptInputSubmit
                disabled={!input.trim() && !isProcessing}
                status={isProcessing && !input.trim() ? "streaming" : undefined}
                className="size-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};