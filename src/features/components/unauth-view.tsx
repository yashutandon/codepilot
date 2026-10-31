"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@/features/auth";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRightIcon,
  Code2Icon,
  CpuIcon,
  FolderGit2Icon,
  TerminalIcon,
  CheckIcon,
  SparklesIcon,
  ZapIcon,
  GlobeIcon,
  PlayIcon,
  FileCodeIcon,
  GitBranchIcon,
  FolderOpenIcon,
  XIcon,
  RotateCwIcon,
  ArrowLeftIcon,
  LockIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import {
  SiNodedotjs,
  SiVite,
  SiPython,
  SiRust,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiPostgresql,
  SiWebassembly,
  SiGoogle,
  SiCplusplus,
  SiCss3,
  SiNpm,
} from "react-icons/si";

export const UnauthView = () => {
  const [activeTab, setActiveTab] = useState<"ide" | "terminal" | "ai">("ide");

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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans antialiased overflow-x-hidden selection:bg-[#238636] selection:text-white">
      {/* GitHub Top Header */}
      <header className="sticky top-0 z-50 bg-[#161b22]/95 backdrop-blur-md border-b border-[#30363d] px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center p-1.5 group-hover:border-[#8b949e] transition-colors shadow-xs">
              <Image src="/logo.svg" alt="CodePilot" width={20} height={20} priority />
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#f0f6fc] flex items-center gap-2">
              CodePilot
              <span className="text-[10px] font-mono text-[#8b949e] font-medium px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d]">
                IDE
              </span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-[#8b949e]">
            <a href="#features" className="hover:text-[#f0f6fc] transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-[#f0f6fc] transition-colors">
              Architecture
            </a>
            <a href="#ecosystem" className="hover:text-[#f0f6fc] transition-colors">
              Ecosystem
            </a>
            <a href="#faq" className="hover:text-[#f0f6fc] transition-colors">
              FAQ
            </a>
            <Link
              href="/playground"
              className="text-[#f0f6fc] hover:text-white flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>Playground</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d] font-mono">
                LIVE
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#21262d] border border-[#30363d] text-[11px] font-mono text-[#8b949e]">
            <span className="text-[#3fb950] font-semibold">ONLINE</span>
            <span className="text-[#6e7681]">/</span>
            <span className="text-[#c9d1d9] font-medium">Node.js 18</span>
          </div>

          {/* GitHub Star Link */}
          <a
            href="https://github.com/yashutandon/codepilot"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#c9d1d9] hover:text-[#f0f6fc] rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] transition-colors"
          >
            <FaGithub className="size-3.5" />
            <span className="font-mono text-[11px]">Star</span>
          </a>

          {/* Sign In & Launch Buttons */}
          <SignInButton mode="modal">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent hover:bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] border-[#30363d] h-8 px-3.5 cursor-pointer transition-colors"
            >
              Sign In
            </Button>
          </SignInButton>

          <SignInButton mode="modal">
            <Button
              size="sm"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs px-4 h-8 rounded-md border border-[#2ea043]/50 shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRightIcon className="size-3" />
            </Button>
          </SignInButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 lg:px-12 pt-16 md:pt-24 pb-20 max-w-6xl mx-auto w-full">

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center text-[#f0f6fc] max-w-4xl leading-[1.12]">
          The browser-native IDE for modern software teams.
        </h1>

        {/* Hero Description */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-[#8b949e] text-center max-w-2xl leading-relaxed">
          Run full-stack Node.js environments directly in your browser. Install npm packages, execute commands in live terminals, write code with AI assistance, and sync with GitHub &mdash; with zero local configuration.
        </p>

        {/* Call to Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <SignInButton mode="modal">
            <Button
              size="lg"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs sm:text-sm px-6 h-11 rounded-md flex items-center gap-2 border border-[#2ea043]/60 shadow-xs cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <span>Launch Workspace Free</span>
              <ArrowRightIcon className="size-4" />
            </Button>
          </SignInButton>

          <Link href="/playground">
            <Button
              size="lg"
              variant="outline"
              className="bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border-[#30363d] text-xs sm:text-sm px-5 h-11 rounded-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlayIcon className="size-3.5 text-[#c9d1d9] fill-[#c9d1d9]" />
              <span>Open Live Playground</span>
            </Button>
          </Link>

          <a
            href="https://github.com/yashutandon/codepilot"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] border-[#30363d] text-xs sm:text-sm px-4 h-11 rounded-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FaGithub className="size-4" />
              <span>View Source</span>
            </Button>
          </a>
        </div>

        {/* Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl p-4 rounded-xl bg-[#161b22] border border-[#30363d] text-center font-mono">
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">&lt;50ms</div>
            <div className="text-[11px] text-[#8b949e] mt-0.5">Cold start time</div>
          </div>
          <div className="p-2 border-l border-[#30363d]">
            <div className="text-xl sm:text-2xl font-bold text-[#3fb950] tracking-tight">100%</div>
            <div className="text-[11px] text-[#8b949e] mt-0.5">In-browser execution</div>
          </div>
          <div className="p-2 border-l border-[#30363d]">
            <div className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">Node JS</div>
          </div>
          <div className="p-2 border-l border-[#30363d]">
            <div className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">15+</div>
            <div className="text-[11px] text-[#8b949e] mt-0.5">Languages &amp; runtimes</div>
          </div>
        </div>

        {/* Interactive IDE Preview Mockup */}
        <div className="mt-16 w-full rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden relative">
          {/* IDE Window Title Bar */}
          <div className="h-10 bg-[#21262d] border-b border-[#30363d] px-4 flex items-center justify-between select-none">
            {/* Window Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8b949e]">
              <Code2Icon className="size-3.5 text-[#5fa04e]" />
              <span className="text-[#8b949e]">codepilot</span>
              <span className="text-[#484f58]">/</span>
              <span className="text-[#8b949e]">src</span>
              <span className="text-[#484f58]">/</span>
              <span className="text-[#61dafb] font-medium">App.tsx</span>
            </div>

            {/* Interactive Mode Tabs */}
            <div className="flex items-center rounded-md bg-[#0d1117] p-0.5 border border-[#30363d] text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("ide")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
                  activeTab === "ide"
                    ? "bg-[#238636] text-white shadow-xs"
                    : "text-[#8b949e] hover:text-[#f0f6fc]"
                }`}
              >
                <Code2Icon className="size-3" />
                <span>Editor &amp; Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
                  activeTab === "terminal"
                    ? "bg-[#238636] text-white shadow-xs"
                    : "text-[#8b949e] hover:text-[#f0f6fc]"
                }`}
              >
                <TerminalIcon className="size-3 text-[#5fa04e]" />
                <span>Shell</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
                  activeTab === "ai"
                    ? "bg-[#238636] text-white shadow-xs"
                    : "text-[#8b949e] hover:text-[#f0f6fc]"
                }`}
              >
                <SparklesIcon className="size-3 text-[#ffd43b]" />
                <span>AI Assist</span>
              </button>
            </div>
          </div>

          {/* IDE Content Area */}
          {activeTab === "ide" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-[#0d1117] font-mono text-xs">
              {/* File Tree Left Sidebar */}
              <div className="hidden sm:block lg:col-span-3 border-r border-[#30363d] bg-[#161b22] p-3 select-none">
                <div className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2.5 px-2">
                  Explorer
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[#8b949e]">
                    <span className="text-[9px] text-[#8b949e]">▼</span>
                    <FolderOpenIcon className="size-3.5 text-[#e3b341]" />
                    <span className="font-semibold text-[#f0f6fc]">src</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#21262d] text-[#f0f6fc] font-semibold border border-[#30363d]">
                      <SiReact className="size-3.5 text-[#61dafb]" />
                      <span>App.tsx</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                      <SiTypescript className="size-3.5 text-[#3178c6]" />
                      <span>main.tsx</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                      <SiCss3 className="size-3.5 text-[#264de4]" />
                      <span>styles.css</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                    <SiNpm className="size-3.5 text-[#cb3837]" />
                    <span>package.json</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                    <SiVite className="size-3.5 text-[#bd34fe]" />
                    <span>vite.config.ts</span>
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="mt-20 pt-4 border-t border-[#30363d] text-[11px] text-[#8b949e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GitBranchIcon className="size-3 text-[#8b949e]" />
                      <span>Branch:</span>
                    </span>
                    <span className="text-[#f0f6fc] font-medium">main</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <SiNodedotjs className="size-3 text-[#5fa04e]" />
                      <span>Engine:</span>
                    </span>
                    <span className="text-[#5fa04e] font-semibold">Node v18.20.2</span>
                  </div>
                </div>
              </div>

              {/* Code Editor Center Panel */}
              <div className="lg:col-span-5 border-r border-[#30363d] bg-[#0d1117] flex flex-col">
                {/* Editor File Tab Bar */}
                <div className="h-8 bg-[#161b22] border-b border-[#30363d] flex items-center text-xs">
                  {/* Active App.tsx Tab */}
                  <div className="h-full px-3 bg-[#0d1117] border-r border-[#30363d] border-t-2 border-t-[#238636] flex items-center gap-2 text-[#f0f6fc] font-medium">
                    <SiReact className="size-3.5 text-[#61dafb]" />
                    <span>App.tsx</span>
                    <XIcon className="size-3 text-[#6e7681] hover:text-[#f0f6fc] ml-1 cursor-pointer" />
                  </div>
                  {/* Inactive styles.css Tab */}
                  <div className="h-full px-3 border-r border-[#30363d] flex items-center gap-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer hidden sm:flex">
                    <SiCss3 className="size-3 text-[#264de4]" />
                    <span>styles.css</span>
                  </div>
                </div>
                {/* Editor Code Lines (Clean GitHub Dark Code Highlighting) */}
                <div className="p-4 overflow-x-auto text-[11px] sm:text-xs leading-relaxed space-y-1 text-[#c9d1d9] font-mono">
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">1</span>
                    <span className="text-[#ff7b72]">import</span> &#123; useState, useEffect &#125;{" "}
                    <span className="text-[#ff7b72]">from</span>{" "}
                    <span className="text-[#7ee787]">&quot;react&quot;</span>;
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">2</span>
                    <span className="text-[#ff7b72]">import</span> &#123; SparklesIcon &#125;{" "}
                    <span className="text-[#ff7b72]">from</span>{" "}
                    <span className="text-[#7ee787]">&quot;lucide-react&quot;</span>;
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">3</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">4</span>
                    <span className="text-[#ff7b72]">export default function</span>{" "}
                    <span className="text-[#f0f6fc] font-bold">App</span>() &#123;
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">5</span>
                    <span className="text-[#ff7b72] pl-3">const</span> [count, setCount] ={" "}
                    <span className="text-[#f0f6fc]">useState</span>(0);
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">6</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">7</span>
                    <span className="text-[#ff7b72] pl-3">return</span> (
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">8</span>
                    <span className="text-[#7ee787] pl-6">&lt;main</span>{" "}
                    <span className="text-[#c9d1d9]">className</span>=
                    <span className="text-[#7ee787]">&quot;flex flex-col items-center gap-4 p-8&quot;</span>
                    <span className="text-[#7ee787]">&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">9</span>
                    <span className="text-[#7ee787] pl-9">&lt;h1</span>{" "}
                    <span className="text-[#c9d1d9]">className</span>=
                    <span className="text-[#7ee787]">&quot;text-2xl font-bold text-white&quot;</span>
                    <span className="text-[#7ee787]">&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">10</span>
                    <span className="pl-12 text-[#f0f6fc]">Hello from CodePilot WebContainer!</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">11</span>
                    <span className="text-[#7ee787] pl-9">&lt;/h1&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">12</span>
                    <span className="text-[#7ee787] pl-9">&lt;button</span>{" "}
                    <span className="text-[#c9d1d9]">onClick</span>=&#123;() =&gt; setCount(c =&gt; c + 1)&#125;
                    <span className="text-[#7ee787]">&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">13</span>
                    <span className="pl-12 text-[#3fb950] font-bold">Count: &#123;count&#125;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">14</span>
                    <span className="text-[#7ee787] pl-9">&lt;/button&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">15</span>
                    <span className="text-[#7ee787] pl-6">&lt;/main&gt;</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">16</span>
                    <span className="pl-3">);</span>
                  </div>
                  <div>
                    <span className="text-[#6e7681] select-none mr-3">17</span>
                    <span>&#125;</span>
                  </div>
                </div>
              </div>

              {/* Right Live Preview & Terminal Split Panel */}
              <div className="lg:col-span-4 flex flex-col bg-[#0d1117]">
                {/* Live Preview Top Half */}
                <div className="flex-1 flex flex-col justify-between border-b border-[#30363d] bg-[#161b22]">
                  {/* Real Browser Address Bar */}
                  <div className="p-2.5 border-b border-[#30363d] flex items-center justify-between gap-2 text-[11px] text-[#8b949e]">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeftIcon className="size-3 text-[#6e7681]" />
                      <RotateCwIcon className="size-3 text-[#6e7681]" />
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0d1117] border border-[#30363d] font-mono text-[10px] text-[#c9d1d9] max-w-[200px]">
                      <LockIcon className="size-2.5 text-[#5fa04e]" />
                      <span className="truncate">localhost:3000</span>
                    </div>
                    <span className="text-[#5fa04e] font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d]">
                      HMR 3000
                    </span>
                  </div>

                  {/* Rendered Output matching App.tsx */}
                  <div className="my-auto p-6 text-center space-y-3.5">
                    <div className="size-11 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto shadow-xs">
                      <SiReact className="size-6 text-[#61dafb] animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-bold text-[#f0f6fc]">
                        Hello from CodePilot WebContainer!
                      </div>
                      <div className="text-[10px] text-[#8b949e]">
                        Rendered directly from src/App.tsx
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-xs text-white font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>Count: 42</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 font-mono text-[#a5d6ff]">
                        Live
                      </span>
                    </button>
                  </div>
                </div>

                {/* Terminal Bottom Half */}
                <div className="h-44 bg-[#0d1117] p-3 font-mono text-[11px] leading-relaxed space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[#8b949e] border-b border-[#30363d] pb-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <TerminalIcon className="size-3 text-[#5fa04e]" />
                      <span className="text-[#c9d1d9] font-medium">Terminal: zsh (WebContainer 18)</span>
                    </div>
                    <span className="text-[10px] text-[#5fa04e] font-semibold">Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#5fa04e] font-bold">codepilot:~$</span>
                    <span className="text-[#f0f6fc]">npm run dev</span>
                  </div>
                  <div className="text-[#8b949e]">&gt; my-app@0.0.0 dev</div>
                  <div className="text-[#5fa04e] font-semibold">&gt; VITE v5.4.8 ready in 118 ms</div>
                  <div className="text-[#8b949e]">
                    &gt; Local: <span className="text-[#61dafb] underline">http://localhost:3000/</span>
                  </div>
                  <div className="text-[#8b949e] text-[10px]">
                    [vite] hmr update /src/App.tsx (2ms)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "terminal" && (
            <div className="p-6 bg-[#0d1117] font-mono text-xs text-[#c9d1d9] space-y-2 leading-relaxed min-h-[460px]">
              <div className="flex items-center gap-2 text-[#8b949e]">
                <span className="text-[#3fb950] font-bold">codepilot@browser:~$</span>
                <span className="text-[#f0f6fc]">node -v &amp;&amp; npm -v</span>
              </div>
              <div className="text-[#f0f6fc] pl-4 font-semibold">v18.20.2 / npm 10.5.0 (Running natively inside WebAssembly)</div>
              <div className="flex items-center gap-2 text-[#8b949e]">
                <span className="text-[#3fb950] font-bold">codepilot@browser:~$</span>
                <span className="text-[#f0f6fc]">npm install express cors dotenv</span>
              </div>
              <div className="text-[#8b949e] pl-4">
                added 48 packages in 0.84s (Instant local resolution, zero remote VM latency)
              </div>
              <div className="flex items-center gap-2 text-[#8b949e]">
                <span className="text-[#3fb950] font-bold">codepilot@browser:~$</span>
                <span className="text-[#f0f6fc]">node server.js</span>
              </div>
              <div className="text-[#3fb950] pl-4 font-semibold">
                [Express] Server listening on port 8080 &mdash; Browser Proxy Mounted
              </div>
              <div className="text-[#8b949e] pl-4">
                Full POSIX filesystem virtualization active with in-memory SQLite / storage support.
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="p-6 bg-[#0d1117] font-mono text-xs text-[#c9d1d9] space-y-3 leading-relaxed min-h-[460px]">
              <div className="flex items-center gap-2 text-[#f0f6fc]">
                <SparklesIcon className="size-4 text-[#3fb950]" />
                <span className="font-semibold">CodePilot AI Assistant</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#f0f6fc]">
                <span className="text-[#8b949e] font-semibold">User:</span> Add a responsive dark mode navbar with Google OAuth and user profile menu.
              </div>
              <div className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] space-y-2">
                <div className="text-[#3fb950] font-semibold flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-[#3fb950]" />
                  Generating component in `src/components/navbar.tsx`...
                </div>
                <div className="text-[11px] text-[#8b949e]">
                  Diff applied: +84 lines, 0 conflicts. Auto-imported icons and connected session state seamlessly.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Bento Grid (Clean GitHub Dark Panels) */}
        <section id="features" className="mt-28 w-full">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#f0f6fc]">
              Engineered for developer velocity.
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Everything you expect from VS Code, running inside an isolated browser sandbox with zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {/* Bento Card 1: WebContainers */}
            <div className="md:col-span-2 p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between hover:border-[#8b949e] transition-colors">
              <div>
                <div className="size-9 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#3fb950] mb-4">
                  <CpuIcon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[#f0f6fc] mb-2">
                  WebContainer Runtime Engine
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-xl">
                  Run full Node.js runtimes natively inside your browser tab with xterm.js terminal integration. Install npm packages at local SSD speeds, launch development servers, and run build pipelines without remote server bills.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <SiNodedotjs className="size-3.5 text-[#5fa04e]" />
                  <span>Node.js 18</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <SiVite className="size-3.5 text-[#bd34fe]" />
                  <span>Vite HMR</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <SiWebassembly className="size-3.5 text-[#654ff0]" />
                  <span>WebAssembly</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#3fb950] font-medium flex items-center gap-1.5">
                  <ZapIcon className="size-3.5 text-[#3fb950]" />
                  <span>Zero Latency</span>
                </span>
              </div>
            </div>

            {/* Bento Card 2: AI Coding Assistant */}
            <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between hover:border-[#8b949e] transition-colors">
              <div>
                <div className="size-9 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#f0f6fc] mb-4">
                  <SparklesIcon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[#f0f6fc] mb-2">
                  AI Pair Programming
                </h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Generate features, resolve bugs, and execute prompt-driven edits powered by Google Gemini and Groq with instant visual diffs.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <SiGoogle className="size-3.5 text-[#4285f4]" />
                  <span>Gemini 2.5</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <CpuIcon className="size-3.5 text-[#f55036]" />
                  <span>Groq Llama 3.3</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#3fb950] font-medium flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-[#3fb950]" />
                  <span>Instant Diffs</span>
                </span>
              </div>
            </div>

            {/* Bento Card 3: Multi-Language Playground */}
            <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between hover:border-[#8b949e] transition-colors">
              <div>
                <div className="size-9 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#f0f6fc] mb-4">
                  <Code2Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[#f0f6fc] mb-2">
                  Multi-Language Playground
                </h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Execute Python, Go, Rust, Java, C++, TypeScript, and SQL code in sandbox runtimes with zero local compiler setup.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#c9d1d9] flex items-center gap-1.5">
                    <SiPython className="size-3 text-[#387eb8]" /> Python
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#c9d1d9] flex items-center gap-1.5">
                    <SiRust className="size-3 text-[#dea584]" /> Rust
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#c9d1d9] flex items-center gap-1.5">
                    <SiGo className="size-3 text-[#00add8]" /> Go
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#c9d1d9] flex items-center gap-1.5">
                    <SiTypescript className="size-3 text-[#3178c6]" /> TS/JS
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[10px] font-mono text-[#c9d1d9] flex items-center gap-1.5">
                    <SiCplusplus className="size-3 text-[#00599c]" /> C++
                  </span>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-mono text-[#3fb950] font-medium">
                15+ Isolated Runtimes
              </div>
            </div>

            {/* Bento Card 4: GitHub Synchronization */}
            <div className="md:col-span-2 p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between hover:border-[#8b949e] transition-colors">
              <div>
                <div className="size-9 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#3fb950] mb-4">
                  <FolderGit2Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-[#f0f6fc] mb-2">
                  Two-Way GitHub Synchronization
                </h3>
                <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed max-w-xl">
                  Import any public or private repository directly into an isolated workspace. Edit files, test live in the browser, commit changes, and export new repositories without managing SSH keys or local git clones.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono text-[#8b949e]">
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <FaGithub className="size-3.5 text-[#f0f6fc]" /> 1-Click Import
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <FolderGit2Icon className="size-3.5 text-[#3fb950]" /> Direct Export
                </span>
                <span className="px-2.5 py-1 rounded bg-[#21262d] border border-[#30363d] text-[#c9d1d9] flex items-center gap-1.5">
                  <GitBranchIcon className="size-3.5 text-[#8b949e]" /> Branch Management
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Support Badges */}
        <section id="ecosystem" className="mt-20 md:mt-24 w-full text-center">
          <div className="text-xs font-mono uppercase tracking-wider text-[#8b949e] mb-6">
            Supported Languages &amp; Frameworks
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-w-4xl mx-auto">
            {/* Node.js */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#5fa04e]/60 transition-colors">
              <SiNodedotjs className="size-4 text-[#5fa04e]" />
              <span className="text-[#f0f6fc] font-medium">Node.js</span>
            </div>
            {/* React */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#61dafb]/60 transition-colors">
              <SiReact className="size-4 text-[#61dafb]" />
              <span className="text-[#f0f6fc] font-medium">React</span>
            </div>
            {/* Next.js */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-white/60 transition-colors">
              <SiNextdotjs className="size-4 text-white" />
              <span className="text-[#f0f6fc] font-medium">Next.js</span>
            </div>
            {/* TypeScript */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#3178c6]/60 transition-colors">
              <SiTypescript className="size-4 text-[#3178c6]" />
              <span className="text-[#f0f6fc] font-medium">TypeScript</span>
            </div>
            {/* JavaScript */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#f7df1e]/60 transition-colors">
              <SiJavascript className="size-4 text-[#f7df1e]" />
              <span className="text-[#f0f6fc] font-medium">JavaScript</span>
            </div>
            {/* Vite */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#bd34fe]/60 transition-colors">
              <SiVite className="size-4 text-[#bd34fe]" />
              <span className="text-[#f0f6fc] font-medium">Vite</span>
            </div>
            {/* Python 3 */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#387eb8]/60 transition-colors">
              <SiPython className="size-4 text-[#387eb8]" />
              <span className="text-[#f0f6fc] font-medium">Python 3</span>
            </div>
            {/* Tailwind CSS */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#38bdf8]/60 transition-colors">
              <SiTailwindcss className="size-4 text-[#38bdf8]" />
              <span className="text-[#f0f6fc] font-medium">Tailwind</span>
            </div>
            {/* Rust */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#dea584]/60 transition-colors">
              <SiRust className="size-4 text-[#dea584]" />
              <span className="text-[#f0f6fc] font-medium">Rust</span>
            </div>
            {/* Go */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#00add8]/60 transition-colors">
              <SiGo className="size-4 text-[#00add8]" />
              <span className="text-[#f0f6fc] font-medium">Go</span>
            </div>
            {/* HTML5 */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#e34f26]/60 transition-colors">
              <SiHtml5 className="size-4 text-[#e34f26]" />
              <span className="text-[#f0f6fc] font-medium">HTML5</span>
            </div>
            {/* PostgreSQL */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] hover:border-[#4169e1]/60 transition-colors">
              <SiPostgresql className="size-4 text-[#4169e1]" />
              <span className="text-[#f0f6fc] font-medium">PostgreSQL</span>
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section id="architecture" className="mt-20 md:mt-24 w-full max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#f0f6fc]">
              How CodePilot Works
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              A three-step workflow engineered for rapid prototyping and production deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="size-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-mono font-bold text-[#f0f6fc]">
                01
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Initialize or Clone</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Start from a blank canvas, select starter templates (Vite, Next, Express), or import any public/private GitHub repository.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="size-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-mono font-bold text-[#f0f6fc]">
                02
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Code &amp; AI Assist</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Use Monaco code editor with syntax highlighting, terminal execution, and pair programming powered by Gemini and Groq AI.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="size-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-mono font-bold text-[#3fb950]">
                03
              </div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Preview &amp; Export</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Test with real-time browser preview and hot reload. Export directly to your GitHub account with zero local git credentials.
              </p>
            </div>
          </div>
        </section>

        {/* Developer FAQ Accordion */}
        <section id="faq" className="mt-28 w-full max-w-3xl">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f6fc]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Everything you need to know about browser-native development with CodePilot.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="item-1" className="border border-[#30363d] bg-[#161b22] rounded-lg px-4">
              <AccordionTrigger className="text-xs sm:text-sm font-medium text-[#f0f6fc] hover:no-underline py-3.5">
                How does Node.js execute directly inside the browser?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-[#8b949e] leading-relaxed pb-3.5">
                CodePilot utilizes WebContainers &mdash; an in-browser operating system architecture powered by WebAssembly. It runs the official Node.js runtime inside Web Workers and SharedArrayBuffer memory threads without relying on cloud VMs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-[#30363d] bg-[#161b22] rounded-lg px-4">
              <AccordionTrigger className="text-xs sm:text-sm font-medium text-[#f0f6fc] hover:no-underline py-3.5">
                Is my code secure and private?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-[#8b949e] leading-relaxed pb-3.5">
                Yes. Because your code executes within your browser&apos;s isolated memory sandbox, your source code and environment variables are not stored on external computing servers. Your data stays completely under your control.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-[#30363d] bg-[#161b22] rounded-lg px-4">
              <AccordionTrigger className="text-xs sm:text-sm font-medium text-[#f0f6fc] hover:no-underline py-3.5">
                Can I install any npm package?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-[#8b949e] leading-relaxed pb-3.5">
                Yes! Any npm package written in pure JavaScript, TypeScript, or WebAssembly (such as React, Vite, Express, Prisma, Lodash, Tailwind) installs and executes seamlessly at native speeds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-[#30363d] bg-[#161b22] rounded-lg px-4">
              <AccordionTrigger className="text-xs sm:text-sm font-medium text-[#f0f6fc] hover:no-underline py-3.5">
                Do I need to install Node or Docker on my machine?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-[#8b949e] leading-relaxed pb-3.5">
                Zero installations required. You can build, debug, and run full-stack Node.js projects from any device with a modern browser &mdash; including Chromebooks, iPads, and low-spec laptops.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Pre-Footer Call to Action Banner */}
        <section className="mt-28 w-full p-8 sm:p-12 rounded-xl bg-[#161b22] border border-[#30363d] text-center shadow-xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#f0f6fc] tracking-tight">
              Ready to code without limits?
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e]">
              Launch your first workspace in seconds with Google OAuth, GitHub, or email authentication.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <SignInButton mode="modal">
                <Button
                  size="default"
                  className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs px-6 h-10 rounded-md flex items-center gap-2 border border-[#2ea043]/50 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Launch Studio Free</span>
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </SignInButton>
              <Link href="/playground">
                <Button
                  size="default"
                  variant="outline"
                  className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] border-[#30363d] text-xs px-5 h-10 rounded-md transition-colors cursor-pointer"
                >
                  Try Playground
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Production Footer */}
      <footer className="border-t border-[#30363d] py-8 px-6 lg:px-12 bg-[#0d1117] text-[#8b949e]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded bg-[#161b22] border border-[#30363d] flex items-center justify-center p-1">
              <Image src="/logo.svg" alt="CodePilot" width={16} height={16} priority />
            </div>
            <span className="text-xs font-semibold text-[#f0f6fc] tracking-tight">
              CodePilot / Browser-Native IDE
            </span>
            <span className="text-[11px] font-mono text-[#8b949e]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <a
              href="https://github.com/yashutandon/codepilot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#f0f6fc] transition-colors flex items-center gap-1.5"
            >
              <FaGithub className="size-3.5" />
              <span>GitHub</span>
            </a>
            <Link href="/playground" className="hover:text-[#f0f6fc] transition-colors">
              Playground
            </Link>
            <a
              href="https://github.com/yashutandon/codepilot/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#f0f6fc] transition-colors"
            >
              Issues
            </a>
            <div className="flex items-center gap-1.5 text-[#3fb950] font-mono">
              <CheckIcon className="size-3" />
              <span>All Systems 100%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
