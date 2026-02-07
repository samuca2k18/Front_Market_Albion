/**
 * Utilitários consolidados para gerenciar nomes e imagens de items
 * Consolida: itemNameMapper.ts + itemImage.ts
 */

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import type { MyItemPrice } from '../api/types';

// ============================================
// TIPOS
// ============================================

export interface ItemNameParts {
  base: string;
  enchant?: number;
  tier?: number;
}

// ============================================
// CACHE (Global para performance)
// ============================================

const nameCache = new Map<string, string>();

// ============================================
// FUNÇÕES DE SPLIT E PARSE
// ============================================

/**
 * Divide um nome de item em suas partes constituintes
 * Exemplo: "T4_BAG@2" => { base: "T4_BAG", enchant: 2, tier: 4 }
 */
export function splitItemName(itemName: string): ItemNameParts {
  if (!itemName) return { base: '' };

  const [base, enchantStr] = itemName.split('@');
  const enchant = enchantStr ? Number(enchantStr) : undefined;

  // Extrai tier do nome base
  const tierMatch = base.match(/^T(\d+)_/);
  const tier = tierMatch ? parseInt(tierMatch[1], 10) : undefined;

  return { base, enchant, tier };
}

/**
 * Obtém apenas a parte base do nome (sem enchantment)
 * Exemplo: "T4_BAG@2" => "T4_BAG"
 */
export function getBaseItemName(itemName: string): string {
  return itemName.split('@')[0];
}

/**
 * Obtém apenas o nível de encantamento
 * Exemplo: "T4_BAG@2" => 2
 */
export function getEnchantmentFromItemName(itemName: string): number {
  const parts = itemName.split('@');
  if (parts.length > 1) {
    const enchant = parseInt(parts[1], 10);
    return isNaN(enchant) ? 0 : enchant;
  }
  return 0;
}

/**
 * Obtém o tier do item
 * Exemplo: "T4_BAG@2" => 4
 */
export function getTierFromItemName(itemName: string): number | null {
  const match = itemName.match(/^T(\d+)_/);
  if (!match) return null;
  const tier = parseInt(match[1], 10);
  if (Number.isNaN(tier) || tier < 1 || tier > 8) return null;
  return tier;
}

/**
 * Reconstrói um nome de item com enchantment
 * Exemplo: { base: "T4_BAG", enchant: 2 } => "T4_BAG@2"
 */
export function buildItemName(
  base: string,
  enchant?: number
): string {
  return enchant && enchant > 0 ? `${base}@${enchant}` : base;
}

// ============================================
// NOMES AMIGÁVEIS (Tradução)
// ============================================

// Mapeamento em Português
const nameMapPT: Record<string, string> = {
  'MAINSWORD': 'Espada',
  'BAG': 'Bolsa',
  'CAPE': 'Capa',
  'ROYALCALF': 'Cria Reis',
  'HELMET': 'Capacete',
  'ARMOR': 'Armadura',
  'ARMOR_PLATE': 'Placa de Armadura',
  'SHOES': 'Sapatos',
  'SHIELD': 'Escudo',
  'BOW': 'Arco',
  'CROSSBOW': 'Besta',
  'STAFF': 'Cajado',
  'MACE': 'Maça',
  'AXE': 'Machado',
  'HAMMER': 'Martelo',
  'SPEAR': 'Lança',
  'DAGGER': 'Adaga',
  'QUARTERSTAFF': 'Bastão',
  'NATURESTAFF': 'Cajado da Natureza',
  'FIRESTAFF': 'Cajado de Fogo',
  'FROSTSTAFF': 'Cajado de Gelo',
  'CURSEDSTAFF': 'Cajado Amaldiçoado',
  'HOLYSTAFF': 'Cajado Sagrado',
  'ARCANESTAFF': 'Cajado Arcano',
};

// Mapeamento em Inglês
const nameMapEN: Record<string, string> = {
  'MAINSWORD': 'Sword',
  'BAG': 'Bag',
  'CAPE': 'Cape',
  'ROYALCALF': 'Royal Calf',
  'HELMET': 'Helmet',
  'ARMOR': 'Armor',
  'ARMOR_PLATE': 'Armor Plate',
  'SHOES': 'Shoes',
  'SHIELD': 'Shield',
  'BOW': 'Bow',
  'CROSSBOW': 'Crossbow',
  'STAFF': 'Staff',
  'MACE': 'Mace',
  'AXE': 'Axe',
  'HAMMER': 'Hammer',
  'SPEAR': 'Spear',
  'DAGGER': 'Dagger',
  'QUARTERSTAFF': 'Quarterstaff',
  'NATURESTAFF': 'Nature Staff',
  'FIRESTAFF': 'Fire Staff',
  'FROSTSTAFF': 'Frost Staff',
  'CURSEDSTAFF': 'Cursed Staff',
  'HOLYSTAFF': 'Holy Staff',
  'ARCANESTAFF': 'Arcane Staff',
};

// Nomes dos tiers em Português
const tierNamesPT: Record<string, string> = {
  '1': 'Novato',
  '2': 'Iniciante',
  '3': 'Aprendiz',
  '4': 'Adepto',
  '5': 'Perito',
  '6': 'Mestre',
  '7': 'Grão-mestre',
  '8': 'Ancião',
};

// Nomes dos tiers em Inglês
const tierNamesEN: Record<string, string> = {
  '1': 'Novice',
  '2': 'Apprentice',
  '3': 'Journeyman',
  '4': 'Adept',
  '5': 'Expert',
  '6': 'Master',
  '7': 'Grandmaster',
  '8': 'Legendary',
};

/**
 * Converte nome interno para nome amigável com idioma detectado
 * Exemplo: "T4_BAG@2" => "Bolsa do Adepto @2"
 * 
 * ⚠️ Versão síncrona - usa fallback se API não disponível
 */
export function getItemDisplayNameWithEnchantment(
  internalName: string,
  language?: 'pt-BR' | 'en-US'
): string {
  if (!internalName) return '';

  // Verifica cache
  const cacheKey = `${internalName}:${language || 'auto'}`;
  if (nameCache.has(cacheKey)) {
    return nameCache.get(cacheKey)!;
  }

  // Detecta idioma
  const isPT = language
    ? language === 'pt-BR'
    : typeof localStorage !== 'undefined'
      ? (localStorage.getItem('i18nextLng') || 'pt-BR') === 'pt-BR'
      : true;

  const { base, enchant, tier } = splitItemName(internalName);
  const withoutTier = base.replace(/^T\d+_/, '');

  // Seleciona mapa correto
  const nameMap = isPT ? nameMapPT : nameMapEN;
  const tierNames = isPT ? tierNamesPT : tierNamesEN;

  // Mapeia nome base
  let prettyName = nameMap[withoutTier] || withoutTier
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Adiciona tier se disponível
  if (tier) {
    const tierName = tierNames[tier.toString()] || `T${tier}`;
    const ofWord = isPT ? 'do' : 'of';
    prettyName = `${prettyName} ${ofWord} ${tierName}`;
  }

  // Adiciona enchantment se houver
  if (enchant && enchant > 0) {
    prettyName = `${prettyName} @${enchant}`;
  }

  // Cacheia resultado
  nameCache.set(cacheKey, prettyName);
  return prettyName;
}

/**
 * Versão assíncrona que busca da API (mais precisa)
 * Fallback para versão síncrona se API falhar
 */
export async function getItemDisplayNameWithEnchantmentAsync(
  internalName: string,
  language?: 'pt-BR' | 'en-US'
): Promise<string> {
  if (!internalName) return '';

  const cacheKey = `${internalName}:${language || 'auto'}`;
  if (nameCache.has(cacheKey)) {
    return nameCache.get(cacheKey)!;
  }

  try {
    const { searchItems } = await import('../api/albion');
    const baseName = getBaseItemName(internalName);
    const results = await searchItems(baseName, language);

    const found = results.find(r => r.unique_name === baseName);
    if (found) {
      const isPT = language ? language === 'pt-BR' : true;
      const nameToUse = isPT
        ? (found.name_pt || found.name_en)
        : (found.name_en || found.name_pt);

      if (nameToUse) {
        const { enchant } = splitItemName(internalName);
        const displayName = enchant && enchant > 0
          ? `${nameToUse} @${enchant}`
          : nameToUse;

        nameCache.set(cacheKey, displayName);
        return displayName;
      }
    }
  } catch (error) {
    console.warn('Erro ao buscar nome do item na API:', error);
  }

  // Fallback para versão síncrona
  return getItemDisplayNameWithEnchantment(internalName, language);
}

// ============================================
// IMAGENS
// ============================================

/**
 * Constrói URL da imagem do item
 * Exemplo: "T4_BAG@2" => "https://render.albiononline.com/v1/item/T4_BAG@2.png"
 */
export function getItemImageUrl(itemName: string): string {
  if (!itemName) return '';

  const { base, enchant } = splitItemName(itemName);
  const suffix = enchant && enchant > 0 ? `@${enchant}` : '';
  const fullName = `${base}${suffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}

/**
 * Extrai URL da imagem de um objeto MyItemPrice
 */
export function getItemImageUrlFromPrice(price: MyItemPrice): string {
  return getItemImageUrl(price.item_name);
}

// ============================================
// HOOKS REACT
// ============================================

/**
 * Hook React para nomes de items com i18n automático
 * Reagir à mudança de idioma
 */
export function useItemDisplayName(internalName: string): string {
  const { i18n } = useTranslation();

  // Limpa cache quando idioma muda
  useEffect(() => {
    nameCache.clear();
  }, [i18n.language]);

  return getItemDisplayNameWithEnchantment(
    internalName,
    i18n.language as 'pt-BR' | 'en-US'
  );
}

// ============================================
// VALIDAÇÃO
// ============================================

/**
 * Verifica se um nome de item é válido
 */
export function isValidItemName(itemName: string): boolean {
  if (!itemName) return false;
  const match = itemName.match(/^T[1-8]_[A-Z_]+(@[0-4])?$/);
  return !!match;
}

/**
 * Limpa o cache de nomes (usar em testes ou quando necessário)
 */
export function clearNameCache(): void {
  nameCache.clear();
}

/**
 * Retorna tamanho do cache (útil para debug)
 */
export function getNameCacheSize(): number {
  return nameCache.size;
}
