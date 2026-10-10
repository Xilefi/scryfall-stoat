export interface Card {
  object: string;
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  released_at: string;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  image_uris: ImageUris;
  prices?: Prices;
  legalities: Record<string, string>;
  scryfall_uri: string;
}

export interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

export interface Prices {
  usd: string | null;
  usd_foil: string | null;
  eur: string | null;
  eur_foil: string | null;
  tix: string | null;
}

export interface Ruling {
  object: string;
  published_at: string;
  source: string;
  comment: string;
}

export interface RulingsResponse {
  object: string;
  data: Ruling[];
}

export interface ApiError {
  object: string;
  code: string;
  type?: string;
  status: number;
  details: string;
}

export type SearchReturnType = Card | "ambiguous" | null;
export type ResponseType = "image" | "url" | "price" | "legal" | "rulings";