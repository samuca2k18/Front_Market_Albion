// src/utils/itemNameMapper.ts

/**
 * Converte o nome interno do item de Albion (ex: "T4_BAG@2")
 * em algo mais legível (ex: "Bag @2").
 */
export function getItemDisplayNameWithEnchantment(internalName: string): string {
    if (!internalName) return '';
  
    // Separa encantamento, se houver (ex: T4_BAG@2 -> ["T4_BAG", "2"])
    const [base, enchant] = internalName.split('@');
  
    // Remove o prefixo de tier (T4_, T5_, etc.)
    const withoutTier = base.replace(/^T\d+_/, '');
  
    // Troca _ por espaço e capitaliza
    const prettyName = withoutTier
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  
    if (enchant) {
      return `${prettyName} @${enchant}`;
    }
  
    return prettyName;
  }
  