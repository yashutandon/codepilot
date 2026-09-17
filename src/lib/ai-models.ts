import { createOpenAI } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { openai as inngestOpenai, gemini as inngestGemini } from "@inngest/agent-kit";
import { generateText, generateObject } from "ai";
import { z } from "zod";

/**
 * Model candidate definition for Vercel AI SDK
 */
export interface AiModelCandidate {
  id: string;
  name: string;
  provider: "groq" | "google" | "huggingface" | "openai";
  supportsTools?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getModel: () => any;
}

/**
 * Model candidate definition for Inngest Agent Kit
 */
export interface InngestModelCandidate {
  id: string;
  name: string;
  provider: "groq" | "google" | "huggingface" | "openai";
  supportsTools: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getModel: () => any;
}

/**
 * Resolves API keys from environment
 */
function getApiKeys() {
  return {
    groq: process.env.GROQ_API_KEY,
    gemini: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
    hf: process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN,
    openai: process.env.OPENAI_API_KEY,
  };
}

/**
 * Verified models available on Groq (checked directly on console.groq.com & Groq API)
 * Note: Models with native tool calling support function calling in Inngest Agent Kit.
 */
export const GROQ_MODELS = {
  // Models with native tool calling:
  QWEN_3_8_27B: "qwen/qwen3.8-27b",          // Alibaba Cloud - 27B fast coding & reasoning (Tool calling: YES)
  GPT_OSS_120B: "openai/gpt-oss-120b",        // OpenAI open weights 120B on Groq (Tool calling: YES)
  GPT_OSS_20B: "openai/gpt-oss-20b",          // OpenAI open weights 20B fast model (Tool calling: YES)
  // High speed text/reasoning models:
  COMPOUND_MINI: "groq/compound-mini",        // Groq Compound Mini agentic/reasoning (Fast text)
  COMPOUND: "groq/compound",                  // Groq Compound agentic/reasoning (Deep reasoning)
  ALLAM_2_7B: "allam-2-7b",                  // SDAIA lightweight 7B model
} as const;

/**
 * Verified models available on Hugging Face Router
 */
export const HF_MODELS = {
  QWEN3_CODER_480B: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
  QWEN2_5_CODER_32B: "Qwen/Qwen2.5-Coder-32B-Instruct",
  DEEPSEEK_V3: "deepseek-ai/DeepSeek-V3-0324",
  DEEPSEEK_R1: "deepseek-ai/DeepSeek-R1",
  LLAMA_3_3_70B: "meta-llama/Llama-3.3-70B-Instruct",
  PHI_4: "microsoft/phi-4",
} as const;

/**
 * Returns active provider summary for UI display
 */
export function getActiveAiProvider(): {
  provider: "groq" | "google" | "huggingface" | "openai";
  name: string;
} {
  const keys = getApiKeys();
  if (keys.groq) {
    return { provider: "groq", name: "Qwen 3.8 27B (Groq Fallback Chain)" };
  }
  if (keys.gemini) {
    return { provider: "google", name: "Google Gemini 2.5 Flash" };
  }
  if (keys.hf) {
    return { provider: "huggingface", name: "Qwen3 Coder (Hugging Face)" };
  }
  return { provider: "openai", name: "OpenAI (GPT-4o-mini)" };
}

// ---------------------------------------------------------------------------
// Inngest Agent Kit Model Chains (with Fallback)
// ---------------------------------------------------------------------------

/**
 * Returns the ordered fallback candidate list for Inngest Coding Agent.
 * Only models that support function/tool calling are included.
 *
 * Sequence:
 * 1. Groq: Qwen 3.8 27B (Fast LPU, native tool calls, coding specialized)
 * 2. Groq: GPT-OSS 120B (120B reasoning, native tool calls)
 * 3. Groq: GPT-OSS 20B (20B fast reasoning, native tool calls)
 * 4. Google: Gemini 2.5 Flash (Reliable high throughput fallback)
 * 5. Hugging Face: Qwen3 Coder 480B
 * 6. Hugging Face: Qwen 2.5 Coder 32B
 * 7. Hugging Face: DeepSeek V3
 * 8. Hugging Face: Meta Llama 3.3 70B
 * 9. OpenAI: GPT-4o-mini
 */
export function getInngestCodingModelCandidates(): InngestModelCandidate[] {
  const keys = getApiKeys();
  const candidates: InngestModelCandidate[] = [];

  // 1. Groq Models (Tool-compatible)
  if (keys.groq) {
    candidates.push({
      id: GROQ_MODELS.QWEN_3_8_27B,
      name: "Qwen 3.8 27B (Groq)",
      provider: "groq",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.QWEN_3_8_27B,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_120B,
      name: "GPT-OSS 120B (Groq)",
      provider: "groq",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.GPT_OSS_120B,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_20B,
      name: "GPT-OSS 20B (Groq)",
      provider: "groq",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.GPT_OSS_20B,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });
  }

  // 2. Google Gemini
  if (keys.gemini) {
    candidates.push({
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash (Google)",
      provider: "google",
      supportsTools: true,
      getModel: () =>
        inngestGemini({
          model: "gemini-2.5-flash",
          apiKey: keys.gemini!,
        }),
    });
  }

  // 3. Hugging Face Models
  if (keys.hf) {
    const hfList = [
      { id: HF_MODELS.QWEN3_CODER_480B, name: "Qwen3 Coder 480B (HuggingFace)" },
      { id: HF_MODELS.QWEN2_5_CODER_32B, name: "Qwen2.5 Coder 32B (HuggingFace)" },
      { id: HF_MODELS.DEEPSEEK_V3, name: "DeepSeek V3 (HuggingFace)" },
      { id: HF_MODELS.LLAMA_3_3_70B, name: "Llama 3.3 70B (HuggingFace)" },
    ];

    for (const hfModel of hfList) {
      candidates.push({
        id: hfModel.id,
        name: hfModel.name,
        provider: "huggingface",
        supportsTools: true,
        getModel: () =>
          inngestOpenai({
            model: hfModel.id,
            baseUrl: "https://router.huggingface.co/v1",
            apiKey: keys.hf!,
          }),
      });
    }
  }

  // 4. OpenAI
  if (keys.openai) {
    candidates.push({
      id: "gpt-4o-mini",
      name: "GPT-4o-mini (OpenAI)",
      provider: "openai",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: "gpt-4o-mini",
          apiKey: keys.openai!,
        }),
    });
  }

  return candidates;
}

/**
 * Returns the ordered fallback candidate list for Inngest Conversation Title Generator.
 * (Does not require tool calling; prioritizes ultra-fast models).
 */
export function getInngestTitleModelCandidates(): InngestModelCandidate[] {
  const keys = getApiKeys();
  const candidates: InngestModelCandidate[] = [];

  // Groq fast reasoning models
  if (keys.groq) {
    candidates.push({
      id: GROQ_MODELS.COMPOUND_MINI,
      name: "Compound Mini (Groq)",
      provider: "groq",
      supportsTools: false,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.COMPOUND_MINI,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });

    candidates.push({
      id: GROQ_MODELS.QWEN_3_8_27B,
      name: "Qwen 3.8 27B (Groq)",
      provider: "groq",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.QWEN_3_8_27B,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_20B,
      name: "GPT-OSS 20B (Groq)",
      provider: "groq",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: GROQ_MODELS.GPT_OSS_20B,
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: keys.groq!,
        }),
    });
  }

  // Google Gemini
  if (keys.gemini) {
    candidates.push({
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash (Google)",
      provider: "google",
      supportsTools: true,
      getModel: () =>
        inngestGemini({
          model: "gemini-2.5-flash",
          apiKey: keys.gemini!,
        }),
    });
  }

  // Hugging Face
  if (keys.hf) {
    candidates.push({
      id: HF_MODELS.QWEN3_CODER_480B,
      name: "Qwen3 Coder 480B (HuggingFace)",
      provider: "huggingface",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: HF_MODELS.QWEN3_CODER_480B,
          baseUrl: "https://router.huggingface.co/v1",
          apiKey: keys.hf!,
        }),
    });
  }

  // OpenAI
  if (keys.openai) {
    candidates.push({
      id: "gpt-4o-mini",
      name: "GPT-4o-mini (OpenAI)",
      provider: "openai",
      supportsTools: true,
      getModel: () =>
        inngestOpenai({
          model: "gpt-4o-mini",
          apiKey: keys.openai!,
        }),
    });
  }

  return candidates;
}

/**
 * Backward compatibility: returns primary Inngest coding model
 */
export function getInngestCodingModel() {
  const candidates = getInngestCodingModelCandidates();
  if (candidates.length > 0) {
    return candidates[0].getModel();
  }
  return inngestOpenai({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

/**
 * Backward compatibility: returns primary Inngest title model
 */
export function getInngestTitleModel() {
  const candidates = getInngestTitleModelCandidates();
  if (candidates.length > 0) {
    return candidates[0].getModel();
  }
  return inngestOpenai({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

// ---------------------------------------------------------------------------
// Vercel AI SDK Model Chains (with Fallback)
// ---------------------------------------------------------------------------

/**
 * Returns candidate models for coding/quick-edit tasks (Vercel AI SDK)
 */
export function getCodingModelCandidates(): AiModelCandidate[] {
  const keys = getApiKeys();
  const candidates: AiModelCandidate[] = [];

  // 1. Groq Models
  if (keys.groq) {
    const groqClient = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: keys.groq,
    });

    candidates.push({
      id: GROQ_MODELS.QWEN_3_8_27B,
      name: "Qwen 3.8 27B (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.QWEN_3_8_27B),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_120B,
      name: "GPT-OSS 120B (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.GPT_OSS_120B),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_20B,
      name: "GPT-OSS 20B (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.GPT_OSS_20B),
    });
  }

  // 2. Google Gemini
  if (keys.gemini) {
    candidates.push({
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash (Google)",
      provider: "google",
      getModel: () => google("gemini-2.5-flash"),
    });
  }

  // 3. Hugging Face Models
  if (keys.hf) {
    const hfClient = createOpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: keys.hf,
    });

    candidates.push({
      id: HF_MODELS.QWEN3_CODER_480B,
      name: "Qwen3 Coder 480B (HuggingFace)",
      provider: "huggingface",
      getModel: () => hfClient(HF_MODELS.QWEN3_CODER_480B),
    });

    candidates.push({
      id: HF_MODELS.QWEN2_5_CODER_32B,
      name: "Qwen 2.5 Coder 32B (HuggingFace)",
      provider: "huggingface",
      getModel: () => hfClient(HF_MODELS.QWEN2_5_CODER_32B),
    });

    candidates.push({
      id: HF_MODELS.DEEPSEEK_V3,
      name: "DeepSeek V3 (HuggingFace)",
      provider: "huggingface",
      getModel: () => hfClient(HF_MODELS.DEEPSEEK_V3),
    });

    candidates.push({
      id: HF_MODELS.LLAMA_3_3_70B,
      name: "Llama 3.3 70B (HuggingFace)",
      provider: "huggingface",
      getModel: () => hfClient(HF_MODELS.LLAMA_3_3_70B),
    });
  }

  // 4. OpenAI
  if (keys.openai) {
    const standardOpenAI = createOpenAI({ apiKey: keys.openai });
    candidates.push({
      id: "gpt-4o-mini",
      name: "GPT-4o-mini (OpenAI)",
      provider: "openai",
      getModel: () => standardOpenAI("gpt-4o-mini"),
    });
  }

  return candidates;
}

/**
 * Returns candidate models for code suggestions & autocomplete (Vercel AI SDK)
 */
export function getSuggestionModelCandidates(): AiModelCandidate[] {
  const keys = getApiKeys();
  const candidates: AiModelCandidate[] = [];

  if (keys.groq) {
    const groqClient = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: keys.groq,
    });

    candidates.push({
      id: GROQ_MODELS.QWEN_3_8_27B,
      name: "Qwen 3.8 27B (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.QWEN_3_8_27B),
    });

    candidates.push({
      id: GROQ_MODELS.COMPOUND_MINI,
      name: "Compound Mini (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.COMPOUND_MINI),
    });

    candidates.push({
      id: GROQ_MODELS.GPT_OSS_20B,
      name: "GPT-OSS 20B (Groq)",
      provider: "groq",
      getModel: () => groqClient(GROQ_MODELS.GPT_OSS_20B),
    });
  }

  if (keys.gemini) {
    candidates.push({
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash (Google)",
      provider: "google",
      getModel: () => google("gemini-2.5-flash"),
    });
  }

  if (keys.hf) {
    const hfClient = createOpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: keys.hf,
    });

    candidates.push({
      id: HF_MODELS.QWEN3_CODER_480B,
      name: "Qwen3 Coder 480B (HuggingFace)",
      provider: "huggingface",
      getModel: () => hfClient(HF_MODELS.QWEN3_CODER_480B),
    });
  }

  if (keys.openai) {
    const standardOpenAI = createOpenAI({ apiKey: keys.openai });
    candidates.push({
      id: "gpt-4o-mini",
      name: "GPT-4o-mini (OpenAI)",
      provider: "openai",
      getModel: () => standardOpenAI("gpt-4o-mini"),
    });
  }

  return candidates;
}

/**
 * Backward compatibility: returns single coding model instance
 */
export function getCodingModel() {
  const candidates = getCodingModelCandidates();
  if (candidates.length > 0) {
    return candidates[0].getModel();
  }
  const standardOpenAI = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return standardOpenAI("gpt-4o-mini");
}

/**
 * Backward compatibility: returns single suggestion model instance
 */
export function getSuggestionModel() {
  const candidates = getSuggestionModelCandidates();
  if (candidates.length > 0) {
    return candidates[0].getModel();
  }
  const standardOpenAI = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return standardOpenAI("gpt-4o-mini");
}

// ---------------------------------------------------------------------------
// Resilient Fallback Execution Wrappers (Vercel AI SDK)
// ---------------------------------------------------------------------------

interface FallbackTextOptions {
  prompt: string;
  system?: string;
  candidates?: AiModelCandidate[];
}

/**
 * Runs `generateText` with automatic cascading fallback across all configured models.
 * If model 1 fails (e.g. 400, 429 rate limit, 500, credit error), it catches and
 * automatically retries with model 2, model 3, etc.
 */
export async function generateTextWithFallback({
  prompt,
  system,
  candidates = getSuggestionModelCandidates(),
}: FallbackTextOptions): Promise<{ text: string; modelUsed: string }> {
  if (candidates.length === 0) {
    throw new Error("No AI models configured. Please check your API keys.");
  }

  const errors: string[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      console.log(`[AI Fallback] Attempting generateText with: ${candidate.name} (attempt ${i + 1}/${candidates.length})`);
      const model = candidate.getModel();
      const result = await generateText({
        model,
        system,
        prompt,
      });

      console.log(`[AI Fallback] ✅ Success with ${candidate.name}`);
      return { text: result.text, modelUsed: candidate.name };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Fallback] ⚠️ Model ${candidate.name} failed: ${errMsg}`);
      errors.push(`${candidate.name}: ${errMsg}`);

      // Small pause if hit rate limit
      if (errMsg.includes("429") && i < candidates.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(`All AI models in fallback chain failed:\n${errors.join("\n")}`);
}

interface FallbackObjectOptions<T extends z.ZodTypeAny> {
  prompt: string;
  system?: string;
  schema: T;
  candidates?: AiModelCandidate[];
}

/**
 * Runs `generateObject` with automatic cascading fallback across all configured models.
 * Used for structured outputs like Quick Edit and Inline Suggestions.
 */
export async function generateObjectWithFallback<T extends z.ZodTypeAny>({
  prompt,
  system,
  schema,
  candidates = getCodingModelCandidates(),
}: FallbackObjectOptions<T>): Promise<{ object: z.infer<T>; modelUsed: string }> {
  if (candidates.length === 0) {
    throw new Error("No AI models configured. Please check your API keys.");
  }

  const errors: string[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    try {
      console.log(`[AI Fallback] Attempting generateObject with: ${candidate.name} (attempt ${i + 1}/${candidates.length})`);
      const model = candidate.getModel();
      const result = await generateObject({
        model,
        system,
        schema,
        prompt,
      });

      console.log(`[AI Fallback] ✅ Success with ${candidate.name}`);
      return { object: result.object as z.infer<T>, modelUsed: candidate.name };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI Fallback] ⚠️ Model ${candidate.name} failed: ${errMsg}`);
      errors.push(`${candidate.name}: ${errMsg}`);

      if (errMsg.includes("429") && i < candidates.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw new Error(`All AI models in fallback chain failed:\n${errors.join("\n")}`);
}
