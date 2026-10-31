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
  BotIcon,
  TerminalIcon,
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
  "Explain project architecture & entry points",
  "Refactor components for performance and clean code",
  "Add strict TypeScript types & error boundaries",
  "Suggest automated unit tests & edge cases",
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
      <div className="flex flex-col h-full bg-sidebar border-l border-border/80">
        {/* Sidebar Header */}
        <div className="h-9 flex items-center justify-between px-3 border-b border-border/70 shrink-0 bg-sidebar">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate font-mono">
              {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isProcessing && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
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
              <div className="py-6 flex flex-col px-1 gap-4">
                <div className="p-3 rounded-lg bg-card/60 border border-border/60">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs mb-1">
                    <BotIcon className="size-3.5 text-primary" />
                    <span>Developer Assistant</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Context-aware AI with full project access. Generate components, inspect files, or refactor logic.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                    Quick suggestions
                  </span>
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptPillClick(prompt)}
                      className="text-left text-xs p-2.5 rounded-md bg-card/80 hover:bg-accent/60 border border-border/70 text-muted-foreground hover:text-foreground transition-colors font-sans leading-snug cursor-pointer"
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
                      <div className="flex items-center gap-2 font-mono">
                        <LoaderIcon className="size-3.5 animate-spin text-primary" />
                        <span>Generating response...</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                        onClick={handleCancel}
                        title="Click to cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-xs text-muted-foreground italic font-mono">
                      Request cancelled
                    </span>
                  ) : (
                    <MessageResponse className="text-xs leading-relaxed font-sans">
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
                        label="Copy message"
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
        <div className="p-2.5 border-t border-border/80 bg-sidebar">
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-lg border border-border/80 bg-background transition-colors focus-within:border-primary/70"
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
            <PromptInputFooter className="px-2.5 pb-2 pt-0 flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground/70">
                ↵ Enter to send
              </span>
              <PromptInputSubmit
                disabled={!input.trim() && !isProcessing}
                status={isProcessing && !input.trim() ? "streaming" : undefined}
                className="size-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};
