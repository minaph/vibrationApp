// utils.ts

export function calculateMA(data: number[], window: number): number {
  const recentData = data.slice(-window);
  return recentData.reduce((sum, val) => sum + val, 0) / window;
}

export function calculateRange(data: number[]): { min: number; max: number } {
  const validData = data.filter(x => !isNaN(x) && x !== null);
  if (validData.length === 0) return { min: -1, max: 1 };
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  const margin = (max - min) * 0.1;
  return { min: min - margin, max: max + margin };
}

export function calculateStandardDeviation(values: number[], mean: number): number {
  return Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );
}
