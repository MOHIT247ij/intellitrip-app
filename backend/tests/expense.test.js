/**
 * expense.test.js
 * Pure unit test for the group expense splitting math — does not
 * require a database connection, so it always runs in CI/offline.
 */
function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

function splitEvenly(amount, participants) {
  const share = roundMoney(amount / participants.length);
  let runningTotal = 0;
  return participants.map((name, idx) => {
    const isLast = idx === participants.length - 1;
    const shareAmount = isLast ? roundMoney(amount - runningTotal) : share;
    runningTotal += shareAmount;
    return { name, shareAmount };
  });
}

describe('Expense splitting', () => {
  it('splits an amount evenly across participants and sums back to the total', () => {
    const result = splitEvenly(1000, ['A', 'B', 'C']);
    const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
    expect(total).toBeCloseTo(1000, 2);
    expect(result).toHaveLength(3);
  });

  it('handles amounts that do not divide evenly without losing paise', () => {
    const result = splitEvenly(100, ['A', 'B', 'C']);
    const total = result.reduce((sum, r) => sum + r.shareAmount, 0);
    expect(total).toBeCloseTo(100, 2);
  });

  it('a single payer gets the full amount', () => {
    const result = splitEvenly(500, ['You']);
    expect(result[0].shareAmount).toBe(500);
  });
});
