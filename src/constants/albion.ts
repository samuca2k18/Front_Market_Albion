// src/constants/albion.ts
export const ALBION_CITIES = [
  'Bridgewatch',
  'Martlock',
  'Thetford',
  'Lymhurst',
  'Fort Sterling',
  'Caerleon',
  'Brecilien',
] as const;

export const ALBION_QUALITIES = [
  { label: 'Todas', value: 0 },
  { label: 'Normal', value: 1 },
  { label: 'Bom', value: 2 },
  { label: 'Excepcional', value: 3 },
  { label: 'Excelente', value: 4 },
  { label: 'Obra-Prima', value: 5 },
] as const;

export const ALBION_ENCHANTMENTS = [
  { label: 'Todos', value: -1 },
  { label: 'Sem encantamento', value: 0 },
  { label: '.1', value: 1 },
  { label: '.2', value: 2 },
  { label: '.3', value: 3 },
  { label: '.4', value: 4 },
] as const;

// 🔥 NOVO: tiers de 1 a 8
export const ALBION_TIERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
