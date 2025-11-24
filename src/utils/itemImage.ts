// src/utils/itemImage.ts
export const getItemImageUrl = (itemName: string): string => {
  // NÃO remove o @ mais! Mantém exatamente como está
  // Ex: T8_BAG@3 → https://render.albiononline.com/v1/item/T8_BAG@3.png
  return `https://render.albiononline.com/v1/item/${itemName}.png`;
};