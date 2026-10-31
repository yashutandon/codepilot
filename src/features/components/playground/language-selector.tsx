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
import { LanguageIcon } from "./language-icon";

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
        className={`w-[210px] h-8 text-xs bg-muted/40 border-border/60 font-medium ${className ?? ""}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <LanguageIcon language={value} className="size-4 shrink-0" useBrandColor />
          <SelectValue>
            <span className="font-medium text-foreground">{current.name}</span>
            <span className="ml-1.5 text-[11px] text-muted-foreground font-mono">
              {current.extension}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="max-h-80">
        {/* Compiled */}
        <SelectGroup>
          <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5 font-mono">
            Compiled Languages
          </SelectLabel>
          {compiled.map((lang) => (
            <SelectItem
              key={lang.id}
              value={lang.id}
              className="text-xs py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 w-full">
                <LanguageIcon language={lang.id} className="size-4 shrink-0" useBrandColor />
                <span className="font-medium text-foreground">{lang.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono ml-auto">
                  {lang.extension}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        {/* Interpreted */}
        <SelectGroup>
          <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5 mt-1 font-mono">
            Interpreted Languages
          </SelectLabel>
          {interpreted.map((lang) => (
            <SelectItem
              key={lang.id}
              value={lang.id}
              className="text-xs py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 w-full">
                <LanguageIcon language={lang.id} className="size-4 shrink-0" useBrandColor />
                <span className="font-medium text-foreground">{lang.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono ml-auto">
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
