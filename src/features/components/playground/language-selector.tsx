"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCompiledLanguages,
  getInterpretedLanguages,
  getLanguageById,
} from "./constants";

// Language icon colors for the colored dot indicators
const LANG_COLORS: Record<string, string> = {
  c: "#555555",
  cpp: "#f34b7d",
  java: "#b07219",
  rust: "#dea584",
  go: "#00add8",
  csharp: "#178600",
  kotlin: "#a97bff",
  swift: "#f05138",
  python: "#3572a5",
  javascript: "#f1e05a",
  typescript: "#3178c6",
  ruby: "#701516",
  php: "#4f5d95",
  perl: "#0298c3",
  r: "#198ce7",
  lua: "#000080",
};

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const LanguageSelector = ({
  value,
  onChange,
  className,
}: LanguageSelectorProps) => {
  const compiled = getCompiledLanguages();
  const interpreted = getInterpretedLanguages();
  const current = getLanguageById(value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`w-[200px] h-8 text-xs bg-muted/40 border-border/60 font-medium ${className ?? ""}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: LANG_COLORS[value] ?? "#888" }}
          />
          <SelectValue>
            {current.name}
            <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
              {current.extension}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="max-h-80">
        {/* Compiled */}
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
            ⚡ Compiled
          </SelectLabel>
          {compiled.map((lang) => (
            <SelectItem
              key={lang.id}
              value={lang.id}
              className="text-xs py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 w-full">
                <span
                  className="size-2 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{
                    backgroundColor: LANG_COLORS[lang.id] ?? "#888",
                  }}
                />
                <span className="font-medium">{lang.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                  {lang.extension}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        {/* Interpreted */}
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5 mt-1">
            🔥 Interpreted
          </SelectLabel>
          {interpreted.map((lang) => (
            <SelectItem
              key={lang.id}
              value={lang.id}
              className="text-xs py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 w-full">
                <span
                  className="size-2 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{
                    backgroundColor: LANG_COLORS[lang.id] ?? "#888",
                  }}
                />
                <span className="font-medium">{lang.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                  {lang.extension}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
