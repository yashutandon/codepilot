import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const internalKey = process.env.CONVEX_INTERNAL_KEY;

async function main() {
  const projectId = "j974wfczj8mczrhsr9ezsv57es8ej2t1";
  console.log(`Checking project ${projectId}...`);
  const processing = await client.query(api.system.getProcessingMessages, {
    internalKey,
    projectId,
  });

  console.log(`Found ${processing.length} processing messages.`);
  for (const msg of processing) {
    await client.mutation(api.system.updateMessageContent, {
      internalKey,
      messageId: msg._id,
      content: "Ready! The project is set up and files are available in the explorer.",
    });
    console.log(`Updated message ${msg._id} to completed!`);
  }
}

main().catch(console.error);
