// utils/itemImage.ts

export function splitItemName(itemName: string): {
  base: string;
  enchant?: number;
} {
  const [base, enchantStr] = itemName.split("@");
  const enchant = enchantStr ? Number(enchantStr) : undefined;
  return { base, enchant };
}

export function getItemImageUrl(itemName: string): string {
  const { base, enchant } = splitItemName(itemName);
  const suffix = enchant && enchant > 0 ? `@${enchant}` : "";
  const fullName = `${base}${suffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}
