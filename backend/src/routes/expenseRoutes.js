
'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const ExpenseController = require('../controllers/ExpenseController');

router.get(
  '/categories',
  authenticate,
  asyncHandler(ExpenseController.getCategories)
);

module.exports = router;
