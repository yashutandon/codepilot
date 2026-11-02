import Firecrawl from "@mendable/firecrawl-js";

const apiKey = process.env.FIRECRAWL_API_KEY || "";
export const firecrawl = new Firecrawl({ apiKey });

const URL_REGEX = /https?:\/\/[^\s)]+/g;

// Authoritative documentation sources for modern web technologies
const DOC_SOURCES: Record<string, string> = {
  react: "https://react.dev/reference/react",
  next: "https://nextjs.org/docs",
  nextjs: "https://nextjs.org/docs",
  tailwind: "https://tailwindcss.com/docs/installation",
  tailwindcss: "https://tailwindcss.com/docs/installation",
  lucide: "https://lucide.dev/guide",
  zustand: "https://zustand.docs.pmnd.rs/getting-started/introduction",
  framer: "https://motion.dev/docs",
  motion: "https://motion.dev/docs",
  vite: "https://vite.dev/guide/",
  convex: "https://docs.convex.dev/home",
  inngest: "https://www.inngest.com/docs",
};

/**
 * Fetches updated, modern documentation using Firecrawl to inject into AI prompts.
 * Automatically scrapes URLs present in the prompt or authoritative docs for modern tech requested.
 */
export async function fetchUpdatedDocumentation(prompt: string): Promise<string> {
  const extractedUrls = prompt.match(URL_REGEX) || [];
  const targetUrls: string[] = [...extractedUrls];

  // If no explicit URLs, check for tech keywords in prompt
  const lower = prompt.toLowerCase();
  for (const [keyword, docUrl] of Object.entries(DOC_SOURCES)) {
    if (lower.includes(keyword) && !targetUrls.includes(docUrl)) {
      targetUrls.push(docUrl);
      if (targetUrls.length >= 2) break; // Top 2 most relevant doc sources
    }
  }

  // If user explicitly asks for "latest", "updated", or "modern" and no tech matched, check general react/vite
  if (
    targetUrls.length === 0 &&
    (lower.includes("latest") || lower.includes("updated") || lower.includes("modern"))
  ) {
    targetUrls.push(DOC_SOURCES.react);
  }

  if (targetUrls.length === 0) {
    return "";
  }

  // If FIRECRAWL_API_KEY is available, scrape live documentation
  if (process.env.FIRECRAWL_API_KEY) {
    try {
      const scrapedDocs: string[] = [];

      for (const url of targetUrls.slice(0, 2)) {
        try {
          const res = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });
          if (res?.markdown) {
            // Trim to max 2500 chars per doc to prevent prompt bloat while preserving modern APIs
            const trimmed = res.markdown.slice(0, 2500);
            scrapedDocs.push(`### Source: ${url}\n${trimmed}`);
          }
        } catch (scrapeErr) {
          console.warn(`[Firecrawl] Failed to scrape ${url}:`, scrapeErr);
        }
      }

      if (scrapedDocs.length > 0) {
        return `
[LATEST DOCUMENTATION & MODERN API SPECS - SCRAPED VIA FIRECRAWL]
${scrapedDocs.join("\n\n---\n\n")}

CRITICAL MODERN VERSION REQUIREMENTS:
1. Always write code targeting the LATEST stable library versions (React 18/19, Vite 5+, Tailwind CSS, Lucide React).
2. Use modern functional components with React Hooks (useState, useEffect, useMemo, useRef). Never use legacy class components.
3. Import icons only from 'lucide-react' with correct PascalCase names (e.g. PlayIcon, CheckIcon, Trash2Icon).
4. Strictly follow the modern patterns and imports demonstrated in the scraped documentation above.
`;
      }
    } catch (err) {
      console.warn("[Firecrawl] fetchUpdatedDocumentation error:", err);
    }
  }

  // Fallback if Firecrawl API key is not yet set: inject built-in modern version specifications
  return `
[MODERN DEVELOPMENT SPECIFICATIONS & LATEST VERSION STANDARDS]
- React: React 18/19 standard. Use functional components, hooks, clean useEffect cleanups, and export default App.
- Vite: Vite 5+ ESM setup with '@vitejs/plugin-react'.
- Styling: Modern Tailwind CSS utility classes. Avoid outdated configuration files.
- Icons: Latest Lucide React ('lucide-react').
- Strict Rule: Use latest modern APIs, no deprecated packages or legacy syntax.
`;
}
