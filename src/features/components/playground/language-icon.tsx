"use client";

import React from "react";
import {
  SiC,
  SiCplusplus,
  SiRust,
  SiGo,
  SiDotnet,
  SiSwift,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiRuby,
  SiPhp,
  SiPerl,
  SiR,
  SiLua,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";
import { Code2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LanguageIconProps {
  language: string;
  className?: string;
  useBrandColor?: boolean;
}

interface LanguageMeta {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  brandColor: string;
}

const LANGUAGE_META: Record<string, LanguageMeta> = {
  c: { icon: SiC, brandColor: "#A8B9CC" },
  cpp: { icon: SiCplusplus, brandColor: "#00599C" },
  "c++": { icon: SiCplusplus, brandColor: "#00599C" },
  java: { icon: FaJava, brandColor: "#ED8B00" },
  rust: { icon: SiRust, brandColor: "#DEA584" },
  rs: { icon: SiRust, brandColor: "#DEA584" },
  go: { icon: SiGo, brandColor: "#00ADD8" },
  golang: { icon: SiGo, brandColor: "#00ADD8" },
  csharp: { icon: TbBrandCSharp, brandColor: "#239120" },
  "c#": { icon: TbBrandCSharp, brandColor: "#239120" },
  cs: { icon: TbBrandCSharp, brandColor: "#239120" },
  dotnet: { icon: SiDotnet, brandColor: "#512BD4" },
  swift: { icon: SiSwift, brandColor: "#F05138" },
  python: { icon: SiPython, brandColor: "#3776AB" },
  py: { icon: SiPython, brandColor: "#3776AB" },
  javascript: { icon: SiJavascript, brandColor: "#F7DF1E" },
  js: { icon: SiJavascript, brandColor: "#F7DF1E" },
  typescript: { icon: SiTypescript, brandColor: "#3178C6" },
  ts: { icon: SiTypescript, brandColor: "#3178C6" },
  tsx: { icon: SiTypescript, brandColor: "#3178C6" },
  jsx: { icon: SiJavascript, brandColor: "#F7DF1E" },
  ruby: { icon: SiRuby, brandColor: "#CC342D" },
  rb: { icon: SiRuby, brandColor: "#CC342D" },
  php: { icon: SiPhp, brandColor: "#777BB4" },
  perl: { icon: SiPerl, brandColor: "#39457E" },
  pl: { icon: SiPerl, brandColor: "#39457E" },
  r: { icon: SiR, brandColor: "#276DC3" },
  lua: { icon: SiLua, brandColor: "#000080" },
};

export const LanguageIcon = ({
  language,
  className,
  useBrandColor = true,
}: LanguageIconProps) => {
  const normalizedKey = language.toLowerCase().trim().replace(/^\./, "");
  const meta = LANGUAGE_META[normalizedKey];

  if (!meta) {
    return <Code2Icon className={cn("size-4", className)} />;
  }

  const IconComponent = meta.icon;

  return (
    <IconComponent
      className={cn("size-4 shrink-0 transition-colors", className)}
      style={useBrandColor ? { color: meta.brandColor } : undefined}
    />
  );
};

