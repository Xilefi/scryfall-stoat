import type { Card, SearchReturnType, ApiError, Ruling, RulingsResponse } from "./types";

/**
 * Recherche une carte sur Scryfall.
 * @param cardName Nom de la carte
 * @param setCode Code du set (ex: "WWK") - Optionnel
 * @param cardNumber Numéro de la carte (ex: "141") - Optionnel
 */
export async function searchCard(
  cardName: string, 
  setCode?: string, 
  cardNumber?: string
): Promise<SearchReturnType> {
  
  let apiUrl: string;

  // Cas 1 : Set spécifié -> On utilise cards/search (plus flexible)
  if (setCode) {
    // Construction de la requête : q=name:"Nom"+set:CODE
    // On essaie d'abord une recherche exacte dans le set
    let query = `name:"${cardName.replace(/"/g, '\\"')}" set:${setCode}`;
    
    // Si on veut être plus tolérant aux fautes, on peut essayer sans guillemets
    // mais cela peut retourner plusieurs résultats.
    
    apiUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=released`;
    
    let response = await fetch(apiUrl);
    
    if (!response.ok) {
      return null; // Pas de carte trouvée dans ce set
    }
    
    const searchData = await response.json() as any;
    
    if (!searchData.data || searchData.data.length === 0) {
      return null;
    }
    
    // Si plusieurs résultats, on prend le premier (ou on pourrait gérer l'ambiguïté)
    return searchData.data[0] as Card;
  } 
  
  // Cas 2 : Pas de set -> On utilise l'approche classique (exact -> fuzzy)
  else {
    apiUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`;
    
    if (cardNumber) {
      apiUrl += `&number=${encodeURIComponent(cardNumber)}`;
    }

    let response = await fetch(apiUrl);
    
    if (!response.ok) {
      const fallbackUrl = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
      response = await fetch(fallbackUrl);
      
      if (!response.ok) {
        const errorData = await response.json() as ApiError;
        if (errorData.type === "ambiguous") {
          return "ambiguous";
        }
        return null;
      }
      
      return await response.json() as Card;
    }
    
    return await response.json() as Card;
  }
}

export async function getRulings(cardId: string): Promise<Ruling[]> {
  const apiUrl = `https://api.scryfall.com/cards/${cardId}/rulings`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    return [];
  }
  
  const data = await response.json() as RulingsResponse;
  return data.data || [];
}