"use client";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorTheme } from "../store/use-editor-theme";
import { EDITOR_THEMES, EditorThemeDefinition } from "../themes/editor-themes";
import { CheckIcon, ChevronDownIcon, PaletteIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector = ({ compact = false, className }: ThemeSelectorProps) => {
  const { themeId, setThemeId } = useEditorTheme();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const currentTheme = useMemo(() => {
    return EDITOR_THEMES.find((t) => t.id === themeId) ?? EDITOR_THEMES[0];
  }, [themeId]);

  const filteredThemes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return EDITOR_THEMES;
    return EDITOR_THEMES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
    );
  }, [search]);

  const categories = useMemo(() => {
    const groups: { [key: string]: EditorThemeDefinition[] } = {};
    for (const theme of filteredThemes) {
      if (!groups[theme.category]) {
        groups[theme.category] = [];
      }
      groups[theme.category].push(theme);
    }
    return groups;
  }, [filteredThemes]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border border-transparent hover:border-border cursor-pointer select-none",
            open && "bg-accent/60 text-foreground border-border",
            className
          )}
          title={`Active Editor Theme: ${currentTheme.name} (Click to change)`}
        >
          <PaletteIcon className="size-3.5 text-primary shrink-0" />
          <span className="truncate max-w-[110px]">{currentTheme.name}</span>

          {!compact && (
            <div className="flex items-center gap-0.5 ml-0.5">
              {currentTheme.dotColors.slice(0, 3).map((color, i) => (
                <span
                  key={i}
                  className="size-1.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          <ChevronDownIcon className="size-3 text-muted-foreground/70 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-72 max-h-96 overflow-y-auto p-1.5 bg-sidebar border border-border rounded-lg shadow-xl"
      >
        {/* Header & Search */}
        <div className="p-1.5 pb-2">
          <div className="flex items-center justify-between pb-1.5 px-0.5">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Editor Themes
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              {EDITOR_THEMES.length} themes
            </span>
          </div>

          <div className="relative flex items-center">
            <SearchIcon className="absolute left-2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter themes..."
              className="w-full h-7 pl-7 pr-6 text-xs bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-1.5 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1 border-border" />

        {/* Theme List by Category */}
        {Object.keys(categories).length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No themes found matching &quot;{search}&quot;
          </div>
        ) : (
          Object.entries(categories).map(([category, themes]) => (
            <DropdownMenuGroup key={category} className="mb-1">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 px-2 py-1 tracking-wider">
                {category}
              </DropdownMenuLabel>
              {themes.map((theme) => {
                const isActive = theme.id === themeId;
                return (
                  <DropdownMenuItem
                    key={theme.id}
                    onSelect={() => {
                      setThemeId(theme.id);
                    }}
                    onClick={() => {
                      setThemeId(theme.id);
                    }}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary font-medium border border-primary/20"
                        : "hover:bg-accent text-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Swatch Preview Box */}
                      <div
                        className="size-5 rounded border border-border/80 flex items-center justify-center gap-0.5 shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.bgPreview }}
                        title={`Background: ${theme.bgPreview}`}
                      >
                        {theme.dotColors.slice(0, 3).map((dotColor, idx) => (
                          <span
                            key={idx}
                            className="size-1 rounded-full inline-block"
                            style={{ backgroundColor: dotColor }}
                          />
                        ))}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="truncate leading-tight text-xs font-medium">
                          {theme.name}
                        </span>
                        {theme.type === "light" && (
                          <span className="text-[9px] text-amber-500/90 font-mono">
                            Light Mode
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <CheckIcon className="size-3.5 text-primary shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
