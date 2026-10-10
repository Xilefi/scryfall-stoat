import type { Card, Ruling } from "./types";
import type { ResponseType } from "./types";

/**
 * Formate les données d'une carte selon le type demandé.
 */
export function formatCardData(
  data: Card | { name: string; rulings: Ruling[] },
  type: ResponseType,
  scryfallUri?: string
): string {
  const d = data as any;

  if (type === "image") {
  // Cas spécial : carte double-face (transform/modal_dfc)
  if ((d.layout === "transform" || d.layout === "modal_dfc") && d.card_faces && d.card_faces.length > 0) {
    // Afficher les deux faces
    const front = d.card_faces[0];
    const back = d.card_faces[1];
    
    let result = `**${front.name}** // **${back.name}**\n\n`;
    result += `Face avant : ${front.image_uris?.large || "N/A"}\n`;
    result += `Face arrière : ${back.image_uris?.large || "N/A"}`;
    
    return result;
  }
  
  // Cas normal : image unique
  return d.image_uris.large;
}

  if (type === "price") {
    const usd = d.prices?.usd || "N/A";
    const eur = d.prices?.eur || "N/A";
    const tix = d.prices?.tix || "N/A";
    return `💰 **${d.name}**\n\nUSD: $${usd} | EUR: €${eur} | Tix: ${tix}`;
  }

  if (type === "legal") {
  const legalities = d.legalities || {};
  const popularFormats = ["standard", "pioneer", "modern", "legacy", "vintage", "commander"];

  const legal: string[] = [];
  const notLegal: string[] = [];
  const banned: string[] = [];
  const restricted: string[] = [];

  for (const format of popularFormats) {
    const status = legalities[format];
    const formattedName = format.charAt(0).toUpperCase() + format.slice(1);

    if (status === "legal") {
      legal.push(formattedName);
    } else if (status === "banned") {
      banned.push(formattedName);
    } else if (status === "restricted") {
      restricted.push(formattedName);
    } else if (status === "not_legal") {
      notLegal.push(formattedName);
    }
  }

    let result = `📋 **${d.name}** — Légalité :\n`;

  if (legal.length > 0) {
    result += `\n✅ Légal : ${legal.join(", ")}`;
  }
  if (restricted.length > 0) {
    result += `\n🔒 Restreint : ${restricted.join(", ")} (1 copie max)`;
  }
  if (banned.length > 0) {
    result += `\n⛔ Banni : ${banned.join(", ")}`;
  }
  if (notLegal.length > 0) {
    // MODIFICATION : "Illégal" au lieu de "Non légal"
    result += `\n❌ Illégal : ${notLegal.join(", ")}`;
  }

  return result;
}

  if (type === "rulings") {
    const rulings = (d as any).rulings || [];
    const totalCount = rulings.length;

    if (totalCount === 0) {
      return `📜 **${d.name}**\n\nAucun ruling disponible.`;
    }

    let result = `📜 **${d.name}** — Rulings (${totalCount}):\n`;

    const recentRulings = rulings.slice(-5);

    for (const ruling of recentRulings) {
      const date = ruling.published_at?.split("T")[0] || "Unknown";
      const source = ruling.source || "Unknown";
      const comment = ruling.comment || "";

      result += `\n\n📅 ${date} — ${source.toUpperCase()}\n${comment}`;
    }

    if (totalCount > 5 && scryfallUri) {
      const cleanUri = scryfallUri.split("?")[0];
      result += `\n\n➡️ ${totalCount - 5} autre(s) ruling(s) disponible(s).\n🔗 Voir tous les rulings : ${cleanUri}/rulings`;
    }

    return result;
  }

  // Default: scryfall URI
  return d.scryfall_uri;
}