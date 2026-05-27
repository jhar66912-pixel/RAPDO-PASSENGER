export function validateDistance(pickup: string, drop: string): number {
  // Mock function to simulate distance checking
  if (!pickup || !drop) return 0;
  // If we type 'far' it pretends it's > 30km
  if (drop.toLowerCase().includes('far')) return 40;
  return 15;
}
