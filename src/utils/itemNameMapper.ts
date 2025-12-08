// src/utils/itemNameMapper.ts

// Cache para armazenar nomes já buscados
const nameCache = new Map<string, string>();

/**
 * Converte o nome interno do item de Albion (ex: "T4_BAG@2")
 * em algo mais legível (ex: "Bolsa do Adepto @2").
 * 
 * Primeiro tenta buscar na API, se não encontrar, usa fallback.
 */
export async function getItemDisplayNameWithEnchantmentAsync(
  internalName: string
): Promise<string> {
  if (!internalName) return '';

  // Verifica cache
  if (nameCache.has(internalName)) {
    return nameCache.get(internalName)!;
  }

  try {
    // Tenta buscar na API
    const { searchItems } = await import('../api/albion');
    const baseName = internalName.split('@')[0];
    const results = await searchItems(baseName);
    
    const found = results.find(r => r.unique_name === baseName);
    if (found && found.name_pt) {
      const displayName = internalName.includes('@')
        ? `${found.name_pt} @${internalName.split('@')[1]}`
        : found.name_pt;
      nameCache.set(internalName, displayName);
      return displayName;
    }
  } catch (error) {
    console.warn('Erro ao buscar nome do item na API:', error);
  }

  // Fallback: usa o método antigo
  const fallbackName = getItemDisplayNameWithEnchantment(internalName);
  nameCache.set(internalName, fallbackName);
  return fallbackName;
}

/**
 * Versão síncrona (fallback) - Converte o nome interno do item de Albion
 * em algo mais legível quando a API não está disponível.
 */
export function getItemDisplayNameWithEnchantment(internalName: string): string {
  if (!internalName) return '';

  // Verifica cache primeiro
  if (nameCache.has(internalName)) {
    return nameCache.get(internalName)!;
  }

  // Separa encantamento, se houver (ex: T4_BAG@2 -> ["T4_BAG", "2"])
  const [base, enchant] = internalName.split('@');

  // Remove o prefixo de tier (T4_, T5_, etc.)
  const withoutTier = base.replace(/^T\d+_/, '');

  // Mapeamento de alguns nomes comuns para português
  const nameMap: Record<string, string> = {
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

  // Tenta mapear o nome
  let prettyName = nameMap[withoutTier] || withoutTier
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Adiciona tier se disponível
  const tierMatch = base.match(/^T(\d+)_/);
  if (tierMatch) {
    const tier = tierMatch[1];
    const tierNames: Record<string, string> = {
      '1': 'Novato',
      '2': 'Iniciante',
      '3': 'Aprendiz',
      '4': 'Adepto',
      '5': 'Perito',
      '6': 'Mestre',
      '7': 'Grão-mestre',
      '8': 'Ancião',
    };
    const tierName = tierNames[tier] || `T${tier}`;
    prettyName = `${prettyName} do ${tierName}`;
  }

  if (enchant) {
    prettyName = `${prettyName} @${enchant}`;
  }

  nameCache.set(internalName, prettyName);
  return prettyName;
}
  