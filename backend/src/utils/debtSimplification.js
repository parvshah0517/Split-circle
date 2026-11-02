'use strict';

/**
 * Debt simplification algorithm.
 *
 * Given a map of { userId → netBalance (integer minor units) }
 * where positive means "is owed" and negative means "owes",
 * returns the minimum set of transfers to settle all debts.
 *
 * Algorithm: Greedy matching (creditors vs debtors).
 * Produces the minimum number of transactions in O(n²) time.
 *
 * @param {Map<number, number>} balances  userId → netBalance
 * @returns {Array<{from: number, to: number, amount: number}>}
 */
function simplifyDebts(balances) {
  const creditors = []; // owes money to group — balance > 0
  const debtors   = []; // owes money to someone — balance < 0

  for (const [userId, balance] of balances) {
    if (balance > 0) creditors.push({ userId, amount:  balance });
    if (balance < 0) debtors.push({   userId, amount: -balance });
  }

  const transfers = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor   = debtors[di];

    const amount = Math.min(creditor.amount, debtor.amount);
    transfers.push({
      from:   debtor.userId,
      to:     creditor.userId,
      amount,
    });

    creditor.amount -= amount;
    debtor.amount   -= amount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount   === 0) di++;
  }

  return transfers;
}

module.exports = { simplifyDebts };
