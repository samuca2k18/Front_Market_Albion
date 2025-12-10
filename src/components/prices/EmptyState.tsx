/**
 * Estado vazio quando não há dados
 */

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: string;
  }
  
  export function EmptyState({
    title,
    description,
    icon = '📭',
  }: EmptyStateProps) {
    return (
      <div className="empty-state">
        <p className="empty-state-icon">{icon}</p>
        <p className="empty-state-title">{title}</p>
        {description && <p className="empty-state-description">{description}</p>}
      </div>
    );
  }