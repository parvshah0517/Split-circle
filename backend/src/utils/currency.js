'use strict';

/**
 * Currency utilities.
 *
 * Rule: ALL monetary values are stored and calculated as integers
 * in the minor currency unit (e.g. paise for INR, cents for USD).
 *
 * Example: ₹1234.56 → 123456
 */

/**
 * Convert display amount to minor units (multiply by 100, round).
 * @param {number} amount  Decimal amount (e.g. 1234.56)
 * @returns {number}       Integer minor units (e.g. 123456)
 */
function toMinorUnits(amount) {
  return Math.round(amount * 100);
}

/**
 * Convert minor units back to display amount.
 * @param {number} minorUnits  e.g. 123456
 * @returns {number}            e.g. 1234.56
 */
function fromMinorUnits(minorUnits) {
  return minorUnits / 100;
}

/**
 * Format minor units as a currency string for display.
 * @param {number} minorUnits
 * @param {string} currency   ISO 4217 code (e.g. 'INR', 'USD')
 * @returns {string}
 */
function formatCurrency(minorUnits, currency = 'INR') {
  const amount = fromMinorUnits(minorUnits);
  try {
    return new Intl.NumberFormat('en-IN', {
      style:    'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Largest-remainder rounding.
 *
 * Distributes `total` integer minor units among `n` participants such that:
 *   - sum(results) === total  (exact, no floating-point drift)
 *   - Each result differs from the "fair share" by at most 1 minor unit.
 *
 * @param {number}   total   Total in minor units
 * @param {number[]} weights Relative weights (already in minor units or proportions)
 * @returns {number[]}       Array of minor-unit amounts, one per weight
 */
function largestRemainderRound(total, weights) {
  const weightSum = weights.reduce((s, w) => s + w, 0);
  if (weightSum === 0) throw new Error('Weights must not all be zero');

  const exact  = weights.map(w => (w / weightSum) * total);
  const floors = exact.map(Math.floor);
  const floorSum = floors.reduce((s, f) => s + f, 0);
  const remainder = total - floorSum;

  // Sort by descending fractional part, pick top `remainder` to round up
  const indices = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .map(x => x.i);

  for (let k = 0; k < remainder; k++) {
    floors[indices[k]] += 1;
  }

  return floors;
}

module.exports = { toMinorUnits, fromMinorUnits, formatCurrency, largestRemainderRound };
