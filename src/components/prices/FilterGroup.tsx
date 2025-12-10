/**
 * Componente reutilizável para groups de checkboxes
 */

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
      <div className="filter-section">
        <div className="filter-section-header">
          <h3>{title}</h3>
          <div className="filter-section-actions">
            {onSelectAll && (
              <button
                className="filter-action-btn"
                onClick={onSelectAll}
                title={`Select all ${title.toLowerCase()}`}
              >
                All
              </button>
            )}
            {onClear && selectedIds.size > 0 && (
              <button
                className="filter-action-btn"
                onClick={onClear}
                title={`Clear all ${title.toLowerCase()}`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
  
        {items.length > 0 ? (
          <div className="filter-items-grid">
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
  
              return (
                <label key={item.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(item.id)}
                    className="filter-checkbox-input"
                  />
                  <span className="filter-checkbox-label">{item.label}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="filter-empty-message">No options available</p>
        )}
      </div>
    );
  }