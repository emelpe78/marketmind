export function checkAlert(
  currentPrice: number | null,
  targetPrice: number | null,
  alertActive: number,
): boolean {
  return (
    currentPrice !== null &&
    targetPrice !== null &&
    currentPrice <= targetPrice &&
    alertActive === 1
  );
}
