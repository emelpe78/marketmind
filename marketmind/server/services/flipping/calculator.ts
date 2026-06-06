export type FlippingScore =
  | "Sehr lohnenswert"
  | "Solide"
  | "Grenzwertig"
  | "Nicht empfehlenswert";

export interface FlipInput {
  buyPrice: number;
  sellPrice: number;
  shipping: number;
  packaging: number;
}

export interface FlipResult {
  netProceeds: number;
  profit: number;
  marginPercent: number;
  score: FlippingScore;
}

export function calculateFlip(input: FlipInput): FlipResult {
  const netProceeds = input.sellPrice - input.shipping - input.packaging;
  const profit = netProceeds - input.buyPrice;
  const marginPercent =
    input.buyPrice > 0 ? (profit / input.buyPrice) * 100 : 0;

  let score: FlippingScore;
  if (marginPercent > 30) score = "Sehr lohnenswert";
  else if (marginPercent >= 15) score = "Solide";
  else if (marginPercent >= 5) score = "Grenzwertig";
  else score = "Nicht empfehlenswert";

  return { netProceeds, profit, marginPercent, score };
}
