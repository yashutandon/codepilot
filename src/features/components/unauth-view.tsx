"use client";

import { useEffect } from "react";
import Image from "next/image";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  Code2Icon,
  CpuIcon,
  FolderGit2Icon,
  SparklesIcon,
  TerminalSquareIcon,
  ZapIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export const UnauthView = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
    root.removeAttribute("data-theme");
    root.removeAttribute("style");
    root.style.colorScheme = "dark";
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col selection:bg-[#1f6feb] selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d] px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center">
            <Image src="/logo.svg" alt="CodePilot" width={18} height={18} />
          </div>
          <span className="font-semibold text-sm text-white flex items-center gap-2">
            CodePilot
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
              v1.0
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/yashutandon/codepilot"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#21262d] border border-transparent hover:border-[#30363d]"
          >
            <FaGithub className="size-3.5" />
            <span>GitHub</span>
          </a>
          <SignInButton mode="modal">
            <Button
              size="sm"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs px-3.5 h-8 rounded-md border border-[#2ea043]/40"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 lg:px-12 py-16 max-w-5xl mx-auto w-full">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e] mb-6">
          <span className="size-2 rounded-full bg-[#3fb950]" />
          <span>Powered by Free Groq Llama 3.3 &amp; Gemini</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-white max-w-3xl leading-tight">
          Browser-Based IDE with Native Code Execution &amp; AI Assistance
        </h1>

        <p className="mt-4 text-sm md:text-base text-[#8b949e] text-center max-w-2xl leading-relaxed">
          Full Node.js runtime in your browser powered by WebContainers. Build, edit, run, and preview projects instantly with GitHub synchronization and zero local configuration.
        </p>

        {/* CTA Actions */}
        <div className="mt-7 flex items-center gap-3">
          <SignInButton mode="modal">
            <Button
              size="default"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs px-5 h-9 rounded-md flex items-center gap-2 border border-[#2ea043]/50"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </SignInButton>
          <a
            href="https://github.com/yashutandon/codepilot"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              size="default"
              variant="outline"
              className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border-[#30363d] text-xs px-4 h-9 rounded-md flex items-center gap-2"
            >
              <FaGithub className="size-3.5" />
              <span>View on GitHub</span>
            </Button>
          </a>
        </div>

        {/* Crisp IDE Mockup */}
        <div className="mt-12 w-full rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
          {/* Mock Titlebar */}
          <div className="h-9 bg-[#0d1117] border-b border-[#30363d] px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-[#ff5f56]" />
              <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="size-2.5 rounded-full bg-[#27c93f]" />
              <span className="text-xs text-[#8b949e] ml-2 font-mono">codepilot &mdash; workspace</span>
            </div>
            <span className="text-[11px] font-mono text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
              WebContainer Node.js 18
            </span>
          </div>

          {/* Mock Window Body */}
          <div className="grid grid-cols-12 h-72 md:h-80 text-xs font-mono">
            {/* File tree */}
            <div className="hidden md:flex col-span-3 bg-[#0d1117] border-r border-[#30363d] p-2.5 flex-col gap-1 text-[#8b949e]">
              <div className="text-[10px] uppercase font-bold text-[#8b949e] px-1 py-0.5">Files</div>
              <div className="flex items-center gap-1.5 text-white bg-[#21262d] px-2 py-1 rounded">
                <Code2Icon className="size-3 text-[#58a6ff]" />
                <span>page.tsx</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1">
                <Code2Icon className="size-3 text-[#e3b341]" />
                <span>layout.tsx</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1">
                <TerminalSquareIcon className="size-3 text-[#bc8cff]" />
                <span>package.json</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1">
                <FolderGit2Icon className="size-3 text-[#3fb950]" />
                <span>components/</span>
              </div>
            </div>

            {/* Code content */}
            <div className="col-span-12 md:col-span-6 bg-[#0d1117] p-3.5 flex flex-col justify-between">
              <div className="space-y-1 text-[#c9d1d9]">
                <div><span className="text-[#ff7b72]">export default function</span> <span className="text-[#d2a8ff]">App</span>() &#123;</div>
                <div className="pl-4"><span className="text-[#ff7b72]">const</span> [active, setActive] = <span className="text-[#79c0ff]">useState</span>(true);</div>
                <div className="pl-4 text-[#8b949e]">&#47;&#47; Fast inline code completion:</div>
                <div className="pl-4 text-[#58a6ff] bg-[#161b22] py-1 px-2 rounded border border-[#30363d]">
                  return &lt;Workspace active=&#123;active&#125; onToggle=&#123;() =&gt; setActive(!active)&#125; /&gt;;
                </div>
                <div>&#125;</div>
              </div>

              <div className="rounded bg-[#161b22] border border-[#30363d] p-2 text-[11px] text-[#3fb950] font-mono">
                <div className="text-[#8b949e]">$ npm run dev</div>
                <div>Local: http://localhost:3000</div>
              </div>
            </div>

            {/* Assistant panel */}
            <div className="hidden md:flex col-span-3 bg-[#161b22] border-l border-[#30363d] p-3 flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-white font-semibold text-xs border-b border-[#30363d] pb-2">
                  <SparklesIcon className="size-3 text-[#3fb950]" />
                  <span>AI Assistant</span>
                </div>
                <div className="bg-[#21262d] p-2 rounded border border-[#30363d] text-[#c9d1d9] text-[11px]">
                  Inspected project structure and created required files with types.
                </div>
              </div>
              <div className="h-7 rounded bg-[#21262d] border border-[#30363d] flex items-center px-2 text-[10px] text-[#8b949e]">
                Ready for prompts...
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
            <div className="size-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center mb-3">
              <ZapIcon className="size-4 text-[#3fb950]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Instant Dev Server</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Start Vite &amp; Next.js dev servers in seconds directly inside your browser with full hot-module reloading.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
            <div className="size-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center mb-3">
              <CpuIcon className="size-4 text-[#58a6ff]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">WebContainer Runtime</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Run Node.js directly inside your browser tab with xterm.js terminal integration. Install npm packages and preview Vite dev servers.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
            <div className="size-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center mb-3">
              <FolderGit2Icon className="size-4 text-[#bc8cff]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">GitHub Sync</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Import public and private repositories seamlessly, edit files, and export changes back to GitHub repositories.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] py-5 px-6 text-center text-xs text-[#8b949e]">
        <p>&copy; {new Date().getFullYear()} CodePilot &bull; Browser IDE</p>
      </footer>
    </div>
  );
};