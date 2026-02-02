import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processMessage } from "@/features/components/conversations/inngest/process-message";
import { importGithubRepo } from "@/features/components/projects/inngest/import-github-status";
import { exportToGithub } from "@/features/components/projects/inngest/export-github-status";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMessage,
    importGithubRepo,
    exportToGithub
  ],
});