const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expenseValidators');

const router = express.Router();
router.use(protect);
router.post('/', validate(createExpenseSchema), expenseController.createExpense);
router.get('/', expenseController.listExpenses);
router.put('/:id', validate(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
