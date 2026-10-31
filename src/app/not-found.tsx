import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  FolderKanbanIcon,
  TerminalSquareIcon,
  FileQuestionIcon,
  SearchIcon,
  TerminalIcon,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-[#c9d1d9] flex flex-col justify-between selection:bg-[#1f6feb] selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <header className="h-12 border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-7 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center p-1 group-hover:border-[#58a6ff]/50 transition-colors">
            <Image src="/logo.svg" alt="CodePilot" width={18} height={18} priority />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
            CodePilot
            <span className="text-[11px] font-mono text-[#8b949e] font-normal px-1.5 py-0.2 rounded bg-[#161b22] border border-[#30363d]">
              IDE
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/playground"
            className="text-xs text-[#8b949e] hover:text-white font-medium px-2.5 py-1.5 rounded-md hover:bg-[#161b22] transition-colors flex items-center gap-1.5"
          >
            <TerminalSquareIcon className="size-3.5 text-violet-400" />
            <span className="hidden sm:inline">Playground</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-[#8b949e] hover:text-white font-medium px-2.5 py-1.5 rounded-md hover:bg-[#161b22] transition-colors flex items-center gap-1.5"
          >
            <FolderKanbanIcon className="size-3.5 text-[#58a6ff]" />
            <span className="hidden sm:inline">Workspaces</span>
          </Link>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 max-w-2xl mx-auto w-full text-center">
        {/* Error Code & Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e] font-mono mb-6">
          <span className="size-1.5 rounded-full bg-rose-500" />
          <span>HTTP 404 &bull; ERR_MODULE_NOT_FOUND</span>
        </div>

        {/* Big Glitch-Style 404 Display */}
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-mono mb-3">
          4<span className="text-rose-500">0</span>4
        </h1>

        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Route or Resource Not Found
        </h2>

        <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto leading-relaxed mb-8">
          The requested path, project workspace, or file does not exist or has been moved to another location.
        </p>

        {/* Developer Terminal Box */}
        <div className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] overflow-hidden text-left mb-8 shadow-xl">
          <div className="h-8 bg-[#161b22] border-b border-[#30363d] px-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8b949e]">
              <TerminalIcon className="size-3.5" />
              <span>codepilot-router &mdash; status.log</span>
            </div>
            <div className="text-[11px] font-mono text-rose-400">Exit 1</div>
          </div>
          <div className="p-4 font-mono text-xs text-[#c9d1d9] space-y-1.5 bg-[#090d16]/90 leading-relaxed">
            <div className="flex items-center gap-2 text-[#8b949e]">
              <span className="text-[#3fb950]">$</span>
              <span>resolve-route --strict</span>
            </div>
            <div className="text-rose-400 pl-4 font-mono">
              [error] ENOENT: no such file or directory, stat &apos;requested_resource&apos;
            </div>
            <div className="text-[#8b949e] pl-4 font-mono">
              at Router.handle (src/app/router.ts:404:12)
            </div>
            <div className="text-[#8b949e] pl-4 font-mono">
              at dispatch (src/middleware.ts:18:5)
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button
            size="default"
            className="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs px-4 h-9 rounded-md flex items-center gap-2 border border-[#2ea043]/50 cursor-pointer shadow-xs transition-colors"
            asChild
          >
            <Link href="/">
              <FolderKanbanIcon className="size-3.5" />
              <span>Return to Workspaces</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="default"
            className="bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border-[#30363d] text-xs px-4 h-9 rounded-md flex items-center gap-2 cursor-pointer transition-colors"
            asChild
          >
            <Link href="/playground">
              <TerminalSquareIcon className="size-3.5 text-violet-400" />
              <span>Polyglot Playground</span>
            </Link>
          </Button>
        </div>
      </main>

      {/* Minimal Developer Footer */}
      <footer className="border-t border-[#30363d] py-4 px-6 text-center text-xs text-[#8b949e] bg-[#0d1117]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <span>CodePilot IDE &bull; Browser-Native Runtime</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              Workspaces
            </Link>
            <Link href="/playground" className="hover:text-white transition-colors">
              Playground
            </Link>
            <a
              href="https://github.com/yashutandon/codepilot/issues"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Report Issue
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

