/**
 * Estado vazio quando não há dados - Versão shadcn UI
 */
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-border/40 bg-card/20 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-background/40 mb-4 border border-border/20 shadow-inner">
        {icon || <PackageOpen className="w-12 h-12 text-muted-foreground/30" />}
      </div>
      <h3 className="text-xl font-black tracking-tight uppercase mb-2 text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs font-medium leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}