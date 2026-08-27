/**
 * expenseService.js
 * -----------------------------------------------------------------
 * Group expense splitting logic. Two modes:
 *   splitEvenly: true  -> divides `amount` evenly across all trip
 *                         travellers registered on the trip's bookings
 *                         plus the payer (falls back to just the payer
 *                         if no other travellers are known)
 *   splitEvenly: false -> caller supplies explicit shareAmount per
 *                         participant (must sum to `amount`)
 * -----------------------------------------------------------------
 */
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

async function createExpense({ tripId, category, amount, description, paidByUserId, splitEvenly, splits, participants }) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: paidByUserId } });
  if (!trip) throw new ApiError(404, 'Trip not found.');

  let splitRows = [];

  if (splitEvenly) {
    // Even split across the named participants (defaults to just the payer if none supplied)
    const names = participants && participants.length ? participants : ['You'];
    const share = roundMoney(amount / names.length);
    let runningTotal = 0;
    splitRows = names.map((name, idx) => {
      const isLast = idx === names.length - 1;
      const shareAmount = isLast ? roundMoney(amount - runningTotal) : share;
      runningTotal += shareAmount;
      return name === 'You'
        ? { userId: paidByUserId, shareAmount }
        : { participantName: name, shareAmount };
    });
  } else {
    const providedTotal = splits.reduce((s, x) => s + (x.shareAmount || 0), 0);
    if (Math.abs(providedTotal - amount) > 0.5) {
      throw new ApiError(400, `Split amounts (₹${providedTotal}) must add up to the total expense (₹${amount}).`);
    }
    splitRows = splits;
  }

  const expense = await prisma.expense.create({
    data: {
      tripId,
      category,
      amount,
      description: description || null,
      paidByUserId,
      splits: { create: splitRows },
    },
    include: { splits: true },
  });

  return expense;
}

async function listExpensesForTrip(userId, tripId) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found.');

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    include: { splits: true, paidBy: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const remainingBudget = trip.budget != null ? roundMoney(Number(trip.budget) - totalSpent) : null;

  return { expenses, totalSpent: roundMoney(totalSpent), byCategory, budget: trip.budget != null ? Number(trip.budget) : null, remainingBudget };
}

async function deleteExpense(userId, expenseId) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId }, include: { trip: true } });
  if (!expense || expense.trip.userId !== userId) throw new ApiError(404, 'Expense not found.');
  await prisma.expense.delete({ where: { id: expenseId } });
}

async function updateExpense(userId, expenseId, data) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId }, include: { trip: true } });
  if (!expense || expense.trip.userId !== userId) throw new ApiError(404, 'Expense not found.');
  return prisma.expense.update({ where: { id: expenseId }, data, include: { splits: true } });
}

module.exports = { createExpense, listExpensesForTrip, deleteExpense, updateExpense };
