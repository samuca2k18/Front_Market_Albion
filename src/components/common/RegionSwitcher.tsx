// src/components/common/RegionSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { useRegion } from '../../context/RegionContext';

export function RegionSwitcher() {
    const { region, regionOption, setRegion, regions } = useRegion();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/60 hover:bg-card/80 transition-colors text-sm font-medium"
                title="Selecionar região do servidor"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span>{regionOption.flag}</span>
                <span className="hidden sm:inline">{regionOption.label}</span>
                <svg
                    className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div
                    role="listbox"
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-border/60 bg-card shadow-xl ring-1 ring-black/5 z-50 overflow-hidden"
                >
                    {regions.map((r) => (
                        <button
                            key={r.id}
                            role="option"
                            aria-selected={r.id === region}
                            onClick={() => { setRegion(r.id); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${r.id === region
                                    ? 'bg-accent/15 text-accent font-semibold'
                                    : 'hover:bg-muted/50 text-foreground'}`}
                        >
                            <span className="text-base">{r.flag}</span>
                            <span>{r.label}</span>
                            {r.id === region && (
                                <svg className="ml-auto w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
