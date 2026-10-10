import { Client } from "revolt.js";
import { searchCard } from "./scryfall";
import { formatCardData } from "./formatter";
import type { ResponseType } from "./types";

const client = new Client();

// ========================
// ÉVÉNEMENTS CLIENT
// ========================

client.on("ready", () => {
  console.log("✅ Bot connecté avec succès !");
});

client.on("messageCreate", async (message) => {
  const content = message.content;
  
  // 1. Extraction des [[...]]
  const regex = /\[\[(.*?)\]\]/g;
  const matches = content.match(regex);

  if (!matches) return;

  const cardNames = matches.map(m => m.slice(2, -2));

  for (const rawName of cardNames) {
    // 2. Détection du préfixe et extraction du set/numéro
    const isImage = rawName.startsWith("!");
    const isPrice = rawName.startsWith("$");
    const isLegal = rawName.startsWith("#");
    const isRulings = rawName.startsWith("?");
    
    let rawCleanName = rawName;
    if (isImage || isPrice || isLegal || isRulings) {
      rawCleanName = rawName.slice(1);
    }

    // Extraction du format [[Nom|SET|NUM]] ou [[Nom|SET]]
    const parts = rawCleanName.split("|");
    const cardName = parts[0] as string;
    const setCode = parts.length > 1 ? parts[1] : undefined;
    const cardNumber = parts.length > 2 ? parts[2] : undefined;

    console.log(`→ Carte : ${cardName} | Set: ${setCode || 'Any'} | Num: ${cardNumber || 'Any'} (image: ${isImage}, price: ${isPrice}, legal: ${isLegal}, rulings: ${isRulings})`);

    try {
      // 3. Recherche de la carte (passage des paramètres set/number)
      const result = await searchCard(cardName, setCode, cardNumber);

      if (result === "ambiguous") {
        await message.reply(`🔍 Nom ambigu : "${cardName}". Veuillez préciser votre recherche.`);
        continue;
      }

      if (!result) {
        await message.reply(`🔍 Carte introuvable : ${cardName}${setCode ? ` (Set: ${setCode})` : ''}. Vérifiez l'orthographe.`);
        continue;
      }

      // 4. Détermination du type de réponse
      let responseType: ResponseType = "url";
      if (isImage) responseType = "image";
      if (isPrice) responseType = "price";
      if (isLegal) responseType = "legal";
      if (isRulings) responseType = "rulings";

      // 5. Formatage de la réponse
      let reply: string;
      
      if (isRulings) {
        // Cas spécial : rulings nécessite une deuxième requête API
        const { getRulings } = await import("./scryfall");
        const rulings = await getRulings(result.id);
        
        const formattedData = {
          name: result.name,
          rulings: rulings
        };
        
        reply = formatCardData(formattedData, "rulings", result.scryfall_uri);
      } else {
        reply = formatCardData(result, responseType);
      }

      // 6. Envoi de la réponse
      await message.reply(reply);

    } catch (error) {
      console.error("Erreur API :", error);
      await message.reply(`⚠️ Erreur lors de la recherche de ${cardName}`);
    }
  }
});

// ========================
// AUTHENTIFICATION
// ========================

client.loginBot(process.env.STOAT_BOT_TOKEN as string);