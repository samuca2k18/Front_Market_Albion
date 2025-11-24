// src/constants/qualities.ts
export const QUALITY_LABELS: Record<number, string> = {
  1: 'Normal',
  2: 'Bom',
  3: 'Excepcional',
  4: 'Excelente',
  5: 'Obra-Prima',
};

export const getQualityLabel = (quality: number | null | undefined): string => {
  if (!quality || quality < 1 || quality > 5) return 'Normal';
  return QUALITY_LABELS[quality] || 'Normal';
};

export const getQualityColor = (quality: number | null | undefined): string => {
  switch (quality) {
    case 1: return '#9E9E9E'; // Cinza - Normal
    case 2: return '#4CAF50'; // Verde - Bom
    case 3: return '#2196F3'; // Azul - Excepcional
    case 4: return '#9C27B0'; // Roxo - Excelente
    case 5: return '#FF9800'; // Laranja - Obra-Prima
    default: return '#9E9E9E';
  }
};