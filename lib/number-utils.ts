/**
 * Format large numbers in a readable way
 * @param num - The number to format
 * @returns Formatted string with appropriate suffix (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

/**
 * Format casualty numbers with appropriate precision
 * @param casualties - The casualty count
 * @returns Formatted string
 */
export function formatCasualties(casualties: number): string {
  if (casualties === 0) return '0';
  
  const absNum = Math.abs(casualties);
  
  if (absNum >= 1000000) {
    return (casualties / 1000000).toFixed(2) + 'M';
  } else if (absNum >= 1000) {
    return (casualties / 1000).toFixed(1) + 'K';
  } else {
    return casualties.toString();
  }
}