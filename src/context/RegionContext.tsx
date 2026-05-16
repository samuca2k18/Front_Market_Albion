// src/context/RegionContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';

export type RegionId = 'europe' | 'west' | 'east';

export interface RegionOption {
    id: RegionId;
    label: string;
    flag: string;
    host: string;
}

export const REGIONS: RegionOption[] = [
    { id: 'europe', label: 'Europe', flag: '🌍', host: 'europe.albion-online-data.com' },
    { id: 'west', label: 'Americas', flag: '🌎', host: 'west.albion-online-data.com' },
    { id: 'east', label: 'Asia', flag: '🌏', host: 'east.albion-online-data.com' },
];

const STORAGE_KEY = 'albion_region';

interface RegionContextValue {
    region: RegionId;
    regionOption: RegionOption;
    setRegion: (r: RegionId) => void;
    regions: RegionOption[];
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
    const [region, setRegionState] = useState<RegionId>(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as RegionId | null;
        return saved && REGIONS.some((r) => r.id === saved) ? saved : 'europe';
    });

    const setRegion = useCallback((r: RegionId) => {
        localStorage.setItem(STORAGE_KEY, r);
        setRegionState(r);
    }, []);

    const regionOption = useMemo(
        () => REGIONS.find((r) => r.id === region) ?? REGIONS[0],
        [region],
    );

    const value = useMemo<RegionContextValue>(
        () => ({ region, regionOption, setRegion, regions: REGIONS }),
        [region, regionOption, setRegion],
    );

    return (
        <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
    );
}

export function useRegion() {
    const ctx = useContext(RegionContext);
    if (!ctx) {
        throw new Error('useRegion deve ser usado dentro de RegionProvider');
    }
    return ctx;
}
