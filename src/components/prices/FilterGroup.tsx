/**
 * Componente reutilizável para grupos de checkboxes - Versão shadcn UI
 */
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FilterGroupProps {
  title: string;
  items: Array<{ id: string | number; label: string }>;
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
}

export function FilterGroup({
  title,
  items,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
}: FilterGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/20 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {title}
        </h3>
        <div className="flex items-center gap-1">
          {onSelectAll && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[9px] font-black uppercase tracking-widest hover:text-primary"
              onClick={onSelectAll}
            >
              All
            </Button>
          )}
          {onClear && selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[9px] font-black uppercase tracking-widest hover:text-destructive"
              onClick={onClear}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const id = `filter-${title}-${item.id}`;

            return (
              <div
                key={item.id}
                className={`flex items-center space-x-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected ? "bg-primary/10 border-primary/30" : "bg-background/20 border-border/40 hover:border-border/80"
                  }`}
                onClick={() => onToggle(item.id)}
              >
                <Checkbox
                  id={id}
                  checked={isSelected}
                  className="border-border/60"
                />
                <Label
                  htmlFor={id}
                  className="text-xs font-bold leading-none cursor-pointer truncate"
                >
                  {item.label}
                </Label>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground font-medium italic py-2">
          Nenhuma opção disponível
        </p>
      )}
    </div>
  );
}