const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const { toPlain } = require('../utils/serializers');
const expenseService = require('../services/expenseService');

const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense({ ...req.body, paidByUserId: req.user.id });
  success(res, toPlain(expense), 201);
});

const listExpenses = asyncHandler(async (req, res) => {
  const tripId = Number(req.query.tripId);
  if (!tripId) throw new ApiError(400, 'A "tripId" query parameter is required.');
  const result = await expenseService.listExpensesForTrip(req.user.id, tripId);
  success(res, toPlain(result));
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user.id, Number(req.params.id), req.body);
  success(res, toPlain(expense));
});

const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user.id, Number(req.params.id));
  success(res, { deleted: true });
});

module.exports = { createExpense, listExpenses, updateExpense, deleteExpense };
