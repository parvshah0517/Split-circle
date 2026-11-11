'use strict';

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();

const ApprovalController = require('../controllers/ApprovalController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { rejectApprovalValidator } = require('../validators/validators');

const approvalIdValidator = param('approvalId')
  .isInt({ min: 1 })
  .withMessage('Invalid approval ID.');

router.use(authenticate);

router.get(
  '/pending',
  asyncHandler(ApprovalController.getPending)
);

router.post(
  '/:approvalId/approve',
  approvalIdValidator,
  validate,
  asyncHandler(ApprovalController.approve)
);

router.post(
  '/:approvalId/reject',
  approvalIdValidator,
  rejectApprovalValidator,
  validate,
  asyncHandler(ApprovalController.reject)
);

module.exports = router;