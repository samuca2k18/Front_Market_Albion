// src/components/common/LanguageSwitcher.tsx
import { useLanguage } from '../../hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { isPortuguese, setLanguage } = useLanguage();

  const currentLang = isPortuguese ? 'PT' : 'EN';
  const currentFlag = isPortuguese ? '🇧🇷' : '🇺🇸';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 flex items-center gap-2 border border-border/40 bg-card/40 hover:bg-card/80 transition-all outline-none">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight">
            {currentFlag} {currentLang}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 bg-card border-border/60">
        <DropdownMenuItem
          onClick={() => setLanguage('pt-BR')}
          className="flex items-center gap-3 cursor-pointer py-2"
        >
          <span className="text-base">🇧🇷</span>
          <span className="text-sm font-medium">Português</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en-US')}
          className="flex items-center gap-3 cursor-pointer py-2"
        >
          <span className="text-base">🇺🇸</span>
          <span className="text-sm font-medium">English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
