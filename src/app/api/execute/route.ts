import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod/v4";

// ─── Rate Limiter ───
// 10 executions per minute per user
let ratelimit: Ratelimit | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "codepilot:playground",
    });
  }
} catch {
  // Rate limiting disabled if Upstash is not configured
}

// ─── Request Validation ───
const executeSchema = z.object({
  compiler: z.string().min(1),       // Wandbox compiler name (e.g. "gcc-13.2.0-c")
  code: z.string().min(1).max(100_000),
  stdin: z.string().max(10_000).optional().default(""),
});

// ─── Wandbox API ───
const WANDBOX_URL = "https://wandbox.org/api/compile.json";

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to run code." },
        { status: 401 }
      );
    }

    // 2. Rate limiting
    if (ratelimit) {
      const { success, remaining, reset } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please wait before running more code.",
            remaining: 0,
            resetAt: reset,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(reset),
            },
          }
        );
      }
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const parsed = executeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { compiler, code, stdin } = parsed.data;

    // 4. Build Wandbox request
    // Wandbox API format: https://github.com/melpon/wandbox/blob/master/kennel2/API.md
    const wandboxBody = {
      compiler,
      code,
      stdin: stdin || "",
      "compiler-option-raw": "",
      "runtime-option-raw": "",
      save: false,
    };

    // 5. Execute on Wandbox
    const startTime = performance.now();

    const wandboxResponse = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wandboxBody),
    });

    const executionTime = Math.round(performance.now() - startTime);

    if (!wandboxResponse.ok) {
      const errorText = await wandboxResponse.text();
      return NextResponse.json(
        {
          error: `Execution failed (HTTP ${wandboxResponse.status})`,
          details: errorText,
        },
        { status: wandboxResponse.status }
      );
    }

    const result = await wandboxResponse.json();

    // 6. Format response
    // Wandbox returns:
    //   program_output  — stdout from the program
    //   program_error   — stderr from the program
    //   compiler_output — stdout from the compiler
    //   compiler_error  — stderr from the compiler
    //   status          — exit code (string "0" for success)
    //   signal          — signal name if killed

    const stdout = result.program_output || "";
    const stderr = result.program_error || "";
    const exitCode = result.status != null ? parseInt(result.status, 10) : null;
    const compilerStdout = result.compiler_output || "";
    const compilerStderr = result.compiler_error || "";
    const compilerMessage = result.compiler_message || "";

    const hasCompileOutput = compilerStdout || compilerStderr || compilerMessage;

    return NextResponse.json({
      stdout,
      stderr,
      output: stdout + stderr,
      code: exitCode,
      signal: result.signal || null,
      compile: hasCompileOutput
        ? {
            stdout: compilerStdout,
            stderr: compilerStderr || compilerMessage,
            code: exitCode,
            signal: null,
          }
        : undefined,
      language: compiler,
      version: compiler,
      executionTime,
    });
  } catch (error) {
    console.error("[/api/execute] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error during code execution." },
      { status: 500 }
    );
  }
}
