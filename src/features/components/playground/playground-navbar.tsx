"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "../projects/ui/editor/components/theme-selector";
import { TerminalSquareIcon } from "lucide-react";

export const PlaygroundNavbar = () => {
  return (
    <nav className="h-10 flex justify-between items-center px-3 bg-sidebar border-b border-border/50 select-none shrink-0">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0 text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 hover:bg-accent/50 text-foreground font-semibold flex items-center gap-1.5"
                  asChild
                >
                  <Link href="/">
                    <Image src="/logo.svg" alt="Logo" height={18} width={18} />
                    <span className="font-bold tracking-tight">CodePilot</span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="mx-1 text-border" />

            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-medium px-1 py-0.5 flex items-center gap-1.5">
                <TerminalSquareIcon className="size-3.5 text-emerald-400" />
                <span>Code Playground</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
          <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>15 Languages</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <ThemeSelector compact className="h-7 text-[11px]" />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7 border border-border/60",
            },
          }}
        />
      </div>
    </nav>
  );
};
