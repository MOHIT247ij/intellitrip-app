/**
 * serializers.js
 * Prisma returns MySQL DECIMAL columns as `Decimal` objects (from
 * decimal.js) and BigInt for some aggregates. JSON.stringify can choke
 * on these. These helpers walk an object/array and convert Decimal/
 * BigInt values to plain numbers before sending JSON to the client.
 */
function toPlain(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === 'bigint') return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    // Prisma Decimal has a toNumber() method
    if (typeof value.toNumber === 'function' && typeof value.toFixed === 'function') {
      return value.toNumber();
    }
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = toPlain(value[key]);
    }
    return out;
  }
  return value;
}

module.exports = { toPlain };
