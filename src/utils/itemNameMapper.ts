import React from 'react';
import { useTranslation } from 'react-i18next';

// Cache para armazenar nomes já buscados
const nameCache = new Map<string, string>();

/**
 * Converte o nome interno do item de Albion (ex: "T4_BAG@2")
 * em algo mais legível (ex: "Bolsa do Adepto @2").
 * 
 * Primeiro tenta buscar na API, se não encontrar, usa fallback.
 */
export async function getItemDisplayNameWithEnchantmentAsync(
  internalName: string,
  language?: 'pt-BR' | 'en-US',
): Promise<string> {
  if (!internalName) return '';

  const lang = language || (localStorage.getItem('i18nextLng') as 'pt-BR' | 'en-US') || 'pt-BR';
  const cacheKey = `${internalName}:${lang}`;

  // Verifica cache
  if (nameCache.has(cacheKey)) {
    return nameCache.get(cacheKey)!;
  }

  try {
    // Tenta buscar na API
    const { searchItems } = await import('../api/albion');
    const baseName = internalName.split('@')[0];
    const results = await searchItems(baseName, lang);
    
    const found = results.find(r => r.unique_name === baseName);
    if (found) {
      // Prioriza o idioma atual
      const nameToUse = lang === 'pt-BR' 
        ? (found.name_pt || found.name_en)
        : (found.name_en || found.name_pt);
      
      if (nameToUse) {
        const displayName = internalName.includes('@')
          ? `${nameToUse} @${internalName.split('@')[1]}`
          : nameToUse;
        nameCache.set(cacheKey, displayName);
        return displayName;
      }
    }
  } catch (error) {
    console.warn('Erro ao buscar nome do item na API:', error);
  }

  // Fallback: usa o método antigo
  const fallbackName = getItemDisplayNameWithEnchantment(internalName);
  nameCache.set(cacheKey, fallbackName);
  return fallbackName;
}

/**
 * Versão síncrona (fallback) - Converte o nome interno do item de Albion
 * em algo mais legível quando a API não está disponível.
 * 
 * Suporta português e inglês baseado no idioma de navegação.
 */
export function getItemDisplayNameWithEnchantment(internalName: string): string {
  if (!internalName) return '';

  // Verifica cache primeiro
  if (nameCache.has(internalName)) {
    return nameCache.get(internalName)!;
  }

  // Detecta idioma atual (fallback para pt-BR)
  const currentLanguage = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('i18nextLng') || 'pt-BR')
    : 'pt-BR';

  const isPT = currentLanguage === 'pt-BR';

  // Separa encantamento, se houver (ex: T4_BAG@2 -> ["T4_BAG", "2"])
  const [base, enchant] = internalName.split('@');

  // Remove o prefixo de tier (T4_, T5_, etc.)
  const withoutTier = base.replace(/^T\d+_/, '');

  // Mapeamento de nomes em Português
  const nameMapPT: Record<string, string> = {
    'MAINSWORD': 'Espada',
    'BAG': 'Bolsa',
    'CAPE': 'Capa',
    'HELMET': 'Capacete',
    'ARMOR': 'Armadura',
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

  // Mapeamento de nomes em Inglês
  const nameMapEN: Record<string, string> = {
    'MAINSWORD': 'Sword',
    'BAG': 'Bag',
    'CAPE': 'Cape',
    'HELMET': 'Helmet',
    'ARMOR': 'Armor',
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

  // Seleciona o mapa correto
  const nameMap = isPT ? nameMapPT : nameMapEN;

  // Tenta mapear o nome
  let prettyName = nameMap[withoutTier] || withoutTier
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Adiciona tier se disponível
  const tierMatch = base.match(/^T(\d+)_/);
  if (tierMatch) {
    const tier = tierMatch[1];
    
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

    const tierNames = isPT ? tierNamesPT : tierNamesEN;
    const tierName = tierNames[tier] || `T${tier}`;
    
    const ofWord = isPT ? 'do' : 'of';
    prettyName = `${prettyName} ${ofWord} ${tierName}`;
  }

  if (enchant) {
    prettyName = `${prettyName} @${enchant}`;
  }

  nameCache.set(internalName, prettyName);
  return prettyName;
}

/**
 * Hook React para usar nomes de items com i18n automático
 * (Opcional - para componentes que precisam reagir à mudança de idioma)
 */
export function useItemDisplayName(internalName: string): string {
  const { i18n } = useTranslation();
  
  // Limpa cache quando idioma muda para forçar atualização
  React.useEffect(() => {
    nameCache.clear();
  }, [i18n.language]);

  return getItemDisplayNameWithEnchantment(internalName);
}