/**
 * Core odds conversion and betting calculation utilities.
 * Pure functions with zero external dependencies.
 */

/**
 * Convert US (Moneyline) odds to Decimal odds.
 * Formula:
 * - If odds < 0: 1 - 100 / odds (e.g. -110 => 1 + 100/110 ≈ 1.909)
 * - If odds > 0: 1 + odds / 100 (e.g. +150 => 1 + 1.5 = 2.50)
 * @param {number} usOdds 
 * @returns {number|null} Decimal odds or null if invalid
 */
export function usToDecimal(usOdds) {
  if (typeof usOdds !== 'number' || isNaN(usOdds) || usOdds === 0) return null;
  if (usOdds < 0) {
    return 1 - (100 / usOdds);
  }
  return 1 + (usOdds / 100);
}

/**
 * Convert Decimal odds to US (Moneyline) odds.
 * Formula:
 * - If decimal >= 2.0: (decimal - 1) * 100
 * - If decimal < 2.0 (and > 1.0): -100 / (decimal - 1)
 * @param {number} decOdds 
 * @returns {number|null} US odds or null if invalid
 */
export function decimalToUs(decOdds) {
  if (typeof decOdds !== 'number' || isNaN(decOdds) || decOdds <= 1) return null;
  if (decOdds >= 2) {
    return Math.round((decOdds - 1) * 100);
  }
  return Math.round(-100 / (decOdds - 1));
}

/**
 * Convert US odds to Implied Probability [0, 1].
 * Formula:
 * - If odds >= 0: 100 / (odds + 100)
 * - If odds < 0: -odds / (-odds + 100) = odds / (odds - 100)
 * @param {number} usOdds 
 * @returns {number|null} Probability between 0 and 1
 */
export function usToProbability(usOdds) {
  if (typeof usOdds !== 'number' || isNaN(usOdds) || usOdds === 0) return null;
  if (usOdds > 0) {
    return 100 / (usOdds + 100);
  }
  return usOdds / (usOdds - 100);
}

/**
 * Convert Implied Probability [0, 1] to US odds.
 * @param {number} prob 
 * @returns {number|null} US odds
 */
export function probabilityToUs(prob) {
  if (typeof prob !== 'number' || isNaN(prob) || prob <= 0 || prob >= 1) return null;
  const dec = probabilityToDecimal(prob);
  if (!dec) return null;
  return decimalToUs(dec);
}

/**
 * Convert Decimal odds to Implied Probability [0, 1].
 * Formula: 1 / decimal
 * @param {number} decOdds 
 * @returns {number|null}
 */
export function decimalToProbability(decOdds) {
  if (typeof decOdds !== 'number' || isNaN(decOdds) || decOdds <= 1) return null;
  return 1 / decOdds;
}

/**
 * Convert Implied Probability [0, 1] to Decimal odds.
 * Formula: 1 / prob
 * @param {number} prob 
 * @returns {number|null}
 */
export function probabilityToDecimal(prob) {
  if (typeof prob !== 'number' || isNaN(prob) || prob <= 0 || prob >= 1) return null;
  return 1 / prob;
}

/**
 * Approximates a decimal odds into standard fractional odds string (e.g. 3/2, 5/1, 10/11, 1/1).
 * @param {number} decOdds 
 * @returns {string|null}
 */
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Approximates a decimal odds into standard fractional odds string (e.g. 3/2, 5/1, 10/11, 1/1).
 * @param {number} decOdds 
 * @returns {string|null}
 */
export function decimalToFractional(decOdds) {
  if (typeof decOdds !== 'number' || isNaN(decOdds) || decOdds <= 1) return null;
  const value = decOdds - 1;
  const tolerance = 0.005;

  // Continued fraction expansion to find closest simple fraction
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = value;
  for (let step = 0; step < 20; step++) {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    
    if (Math.abs(value - h1 / k1) < tolerance || k1 > 100) {
      break;
    }
    const remainder = b - a;
    if (remainder < 1e-6) break;
    b = 1 / remainder;
  }

  if (k1 > 0 && h1 > 0) {
    const d = gcd(h1, k1);
    return `${h1 / d}/${k1 / d}`;
  }
  return null;
}

/**
 * Format US odds with explicit '+' or '-' sign.
 * @param {number} val 
 * @returns {string}
 */
export function formatUsOdds(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  const rounded = Math.round(val);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

/**
 * Format Decimal odds to 2-3 decimal places.
 * @param {number} val 
 * @param {number} precision 
 * @returns {string}
 */
export function formatDecimalOdds(val, precision = 3) {
  if (val === null || val === undefined || isNaN(val)) return '';
  return Number(val.toFixed(precision)).toString();
}

/**
 * Format Probability as decimal [0, 1] and percentage.
 * @param {number} val 
 * @param {number} precision 
 * @returns {string}
 */
export function formatProbability(val, precision = 3) {
  if (val === null || val === undefined || isNaN(val)) return '';
  return Number(val.toFixed(precision)).toString();
}

/**
 * Format Probability as percentage (e.g. 52.38%).
 * @param {number} val 
 * @param {number} precision 
 * @returns {string}
 */
export function formatPercentage(val, precision = 1) {
  if (val === null || val === undefined || isNaN(val)) return '';
  return `${(val * 100).toFixed(precision)}%`;
}

/**
 * Calculate potential payout and profit given stake and decimal odds.
 * @param {number} stake 
 * @param {number} decOdds 
 * @returns {{ profit: number, payout: number }|null}
 */
export function calculatePayout(stake, decOdds) {
  if (typeof stake !== 'number' || isNaN(stake) || stake <= 0) return null;
  if (typeof decOdds !== 'number' || isNaN(decOdds) || decOdds <= 1) return null;
  const payout = stake * decOdds;
  const profit = payout - stake;
  return {
    payout: Math.round(payout * 100) / 100,
    profit: Math.round(profit * 100) / 100
  };
}
