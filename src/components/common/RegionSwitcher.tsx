// src/components/common/RegionSwitcher.tsx
import { useRegion } from '../../context/RegionContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";

export function RegionSwitcher() {
    const { region, regionOption, setRegion, regions } = useRegion();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 flex items-center gap-2 border border-border/40 bg-card/40 hover:bg-card/80 transition-all group outline-none"
                >
                    <span className="text-base">{regionOption.flag}</span>
                    <span className="hidden sm:inline text-sm font-semibold tracking-tight">{regionOption.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border/60 p-1">
                {regions.map((r) => (
                    <DropdownMenuItem
                        key={r.id}
                        onClick={() => setRegion(r.id)}
                        className={`flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-md transition-colors ${r.id === region ? 'bg-primary/10 text-primary font-bold' : ''
                            }`}
                    >
                        <span className="text-lg">{r.flag}</span>
                        <span className="flex-1">{r.label}</span>
                        {r.id === region && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
