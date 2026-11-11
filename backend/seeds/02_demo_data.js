
'use strict';

require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
});

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

const MARKER = 'SPLITCIRCLE_DEMO';
const SALT_ROUNDS = 12;

const USERS = [
  { key: 'alex', name: 'Alex Carter', username: 'alex_d', mobile: '+919000000001', mpin: '1234' },
  { key: 'maya', name: 'Maya Patel', username: 'maya_d', mobile: '+919000000002', mpin: '1234' },
  { key: 'rohan', name: 'Rohan Mehta', username: 'rohan_d', mobile: '+919000000003', mpin: '1234' },
  { key: 'priya', name: 'Priya Shah', username: 'priya_d', mobile: '+919000000004', mpin: '1234' },
  { key: 'sam', name: 'Sam Wilson', username: 'sam_d', mobile: '+919000000005', mpin: '1234' },
];

const ROOMS = [
  {
    key: 'goa',
    name: 'Goa Trip 2026',
    description: 'Our group vacation expenses and activities.',
    code: 'GOA26TRIP1',
    creator: 'alex',
    members: ['alex', 'maya', 'rohan', 'priya', 'sam'],
    budget: 6000000,
    period: 'Goa Trip Budget',
  },
  {
    key: 'flat',
    name: 'Flat Expenses',
    description: 'Shared rent, groceries and household expenses.',
    code: 'FLAT26HOME',
    creator: 'maya',
    members: ['alex', 'maya', 'rohan', 'priya'],
    budget: null,
  },
  {
    key: 'weekend',
    name: 'Weekend Hangout',
    description: 'Food, movies and weekend activities.',
    code: 'WKND26FUN1',
    creator: 'rohan',
    members: ['alex', 'rohan', 'sam'],
    budget: null,
  },
];

const EXPENSES = [
  {
    key: 'goa-hotel',
    room: 'goa',
    title: 'Beach Resort Stay',
    description: 'Two nights at the beach resort.',
    amount: 1800000,
    category: 'Accommodation',
    date: '2026-10-18',
    payer: 'alex',
    creator: 'alex',
    status: 'APPROVED',
    splits: { alex: 360000, maya: 360000, rohan: 360000, priya: 360000, sam: 360000 },
  },
  {
    key: 'goa-scooter',
    room: 'goa',
    title: 'Scooter Rentals',
    description: 'Scooters for exploring Goa.',
    amount: 250000,
    category: 'Transport',
    date: '2026-10-19',
    payer: 'maya',
    creator: 'maya',
    status: 'APPROVED',
    splits: { alex: 50000, maya: 50000, rohan: 50000, priya: 50000, sam: 50000 },
  },
  {
    key: 'goa-dinner',
    room: 'goa',
    title: 'Seafood Dinner',
    description: 'Group dinner by the beach.',
    amount: 620000,
    category: 'Food & Drink',
    date: '2026-10-19',
    payer: 'rohan',
    creator: 'rohan',
    status: 'APPROVED',
    splits: { alex: 124000, maya: 124000, rohan: 124000, priya: 124000, sam: 124000 },
  },
  {
    key: 'goa-boat',
    room: 'goa',
    title: 'Boat Cruise',
    description: 'Boat cruise booking awaiting approval.',
    amount: 400000,
    category: 'Entertainment',
    date: '2026-10-20',
    payer: 'priya',
    creator: 'maya',
    status: 'PENDING_APPROVAL',
    requestedFrom: 'sam',
    splits: { alex: 80000, maya: 80000, rohan: 80000, priya: 80000, sam: 80000 },
  },
  {
    key: 'goa-club',
    room: 'goa',
    title: 'Nightclub Entry',
    description: 'Group entry booking.',
    amount: 300000,
    category: 'Entertainment',
    date: '2026-10-20',
    payer: 'sam',
    creator: 'rohan',
    status: 'REJECTED',
    requestedFrom: 'alex',
    rejectionReason: 'Expense was not agreed upon by the group.',
    splits: { alex: 60000, maya: 60000, rohan: 60000, priya: 60000, sam: 60000 },
  },
  {
    key: 'flat-groceries',
    room: 'flat',
    title: 'Monthly Groceries',
    description: 'Groceries and household supplies.',
    amount: 850000,
    category: 'Groceries',
    date: '2026-11-02',
    payer: 'maya',
    creator: 'maya',
    status: 'APPROVED',
    splits: { alex: 212500, maya: 212500, rohan: 212500, priya: 212500 },
  },
  {
    key: 'flat-electricity',
    room: 'flat',
    title: 'Electricity Bill',
    description: 'Monthly electricity payment.',
    amount: 320000,
    category: 'Utilities',
    date: '2026-11-04',
    payer: 'alex',
    creator: 'alex',
    status: 'APPROVED',
    splits: { alex: 80000, maya: 80000, rohan: 80000, priya: 80000 },
  },
  {
    key: 'flat-cleaning',
    room: 'flat',
    title: 'Cleaning Supplies',
    description: 'Cleaning products for the apartment.',
    amount: 180000,
    category: 'Shopping',
    date: '2026-11-06',
    payer: 'priya',
    creator: 'priya',
    status: 'APPROVED',
    splits: { alex: 45000, maya: 45000, rohan: 45000, priya: 45000 },
  },
  {
    key: 'weekend-movie',
    room: 'weekend',
    title: 'Movie Tickets',
    description: 'Saturday movie tickets.',
    amount: 150000,
    category: 'Entertainment',
    date: '2026-11-07',
    payer: 'rohan',
    creator: 'rohan',
    status: 'APPROVED',
    splits: { alex: 50000, rohan: 50000, sam: 50000 },
  },
  {
    key: 'weekend-dinner',
    room: 'weekend',
    title: 'Dinner and Snacks',
    description: 'Dinner after the movie.',
    amount: 240000,
    category: 'Food & Drink',
    date: '2026-11-07',
    payer: 'alex',
    creator: 'alex',
    status: 'APPROVED',
    splits: { alex: 80000, rohan: 80000, sam: 80000 },
  },
];

async function run() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    throw new Error(
      'Demo seeding disabled. Run with SEED_DEMO_DATA=true.'
    );
  }

  if (config.app.env === 'production' ||
      /prod/i.test(config.db.database)) {
    throw new Error(
      'Refusing to seed a production environment/database.'
    );
  }

  const conn = await mysql.createConnection(config.db);

  try {
    console.log('\n======================================');
    console.log('SplitCircle demo data seed');
    console.log(`Database: ${config.db.database}`);
    console.log(`Host: ${config.db.host}`);
    console.log('======================================\n');

    await conn.beginTransaction();

    const userIds = {};
    const roomIds = {};
    const categoryIds = {};

    // 1. Create or update demo users.
    for (const user of USERS) {
      const mpinHash = await bcrypt.hash(user.mpin, SALT_ROUNDS);

      const [existing] = await conn.execute(
        `SELECT id FROM users
         WHERE username = ? AND deleted_at IS NULL
         LIMIT 1`,
        [user.username]
      );

      let userId;

      if (existing.length) {
        userId = existing[0].id;

        await conn.execute(
          `UPDATE users
           SET name = ?, mobile = ?, mpin_hash = ?
           WHERE id = ?`,
          [user.name, user.mobile, mpinHash, userId]
        );
      } else {
        const [result] = await conn.execute(
          `INSERT INTO users (name, username, mobile, mpin_hash)
           VALUES (?, ?, ?, ?)`,
          [user.name, user.username, user.mobile, mpinHash]
        );

        userId = result.insertId;
      }

      userIds[user.key] = userId;
    }

    console.log('[demo] 5 demo users ready.');

    // 2. Load category IDs.
    const [categories] = await conn.execute(
      'SELECT id, name FROM categories'
    );

    for (const category of categories) {
      categoryIds[category.name] = category.id;
    }

    // 3. Create or update rooms and memberships.
    for (const room of ROOMS) {
      const [existing] = await conn.execute(
        `SELECT id FROM rooms
         WHERE invitation_code = ?
         LIMIT 1`,
        [room.code]
      );

      let roomId;

      if (existing.length) {
        roomId = existing[0].id;

        await conn.execute(
          `UPDATE rooms
           SET name = ?, description = ?, created_by = ?,
               default_currency = 'INR', deleted_at = NULL
           WHERE id = ?`,
          [
            room.name,
            room.description,
            userIds[room.creator],
            roomId,
          ]
        );
      } else {
        const [result] = await conn.execute(
          `INSERT INTO rooms
           (name, description, created_by, invitation_code, default_currency)
           VALUES (?, ?, ?, ?, 'INR')`,
          [
            room.name,
            room.description,
            userIds[room.creator],
            room.code,
          ]
        );

        roomId = result.insertId;
      }

      roomIds[room.key] = roomId;

      for (const member of room.members) {
        await conn.execute(
          `INSERT INTO room_members (room_id, user_id, is_active, left_at)
           VALUES (?, ?, 1, NULL)
           ON DUPLICATE KEY UPDATE is_active = 1, left_at = NULL`,
          [roomId, userIds[member]]
        );
      }

      if (room.budget !== null) {
        await conn.execute(
          `INSERT INTO room_budgets
           (room_id, budget_amount, currency, period_label, created_by)
           VALUES (?, ?, 'INR', ?, ?)
           ON DUPLICATE KEY UPDATE
             budget_amount = VALUES(budget_amount),
             currency = VALUES(currency),
             period_label = VALUES(period_label),
             created_by = VALUES(created_by)`,
          [
            roomId,
            room.budget,
            room.period,
            userIds[room.creator],
          ]
        );
      }
    }

    console.log('[demo] 3 rooms and memberships ready.');

    // 4. Create or update expenses and their splits.
    const expenseIds = {};
    const expenseContributions = [];

    for (const expense of EXPENSES) {
      const roomId = roomIds[expense.room];
      const payerId = userIds[expense.payer];
      const creatorId = userIds[expense.creator];
      const marker = `${MARKER}:${expense.key}`;
      const categoryId = categoryIds[expense.category];

      if (!categoryId) {
        throw new Error(`Missing category: ${expense.category}`);
      }

      const approved = expense.status === 'APPROVED';

      const [existing] = await conn.execute(
        `SELECT id FROM expenses
         WHERE room_id = ? AND notes = ?
         LIMIT 1`,
        [roomId, marker]
      );

      let expenseId;

      const expenseValues = [
        expense.title,
        expense.description,
        expense.amount,
        'INR',
        categoryId,
        expense.date,
        payerId,
        creatorId,
        expense.status,
        approved ? payerId : null,
        approved ? `${expense.date} 12:00:00` : null,
        expense.rejectionReason || null,
        marker,
      ];

      if (existing.length) {
        expenseId = existing[0].id;

        await conn.execute(
          `UPDATE expenses
           SET title = ?, description = ?, total_amount = ?,
               currency = ?, category_id = ?, expense_date = ?,
               paid_by = ?, created_by = ?, status = ?,
               approved_by = ?, approved_at = ?,
               rejection_reason = ?, notes = ?
           WHERE id = ?`,
          [...expenseValues, expenseId]
        );
      } else {
        const [result] = await conn.execute(
          `INSERT INTO expenses
           (room_id, title, description, total_amount, currency,
            category_id, expense_date, paid_by, created_by,
            status, approved_by, approved_at, rejection_reason, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [roomId, ...expenseValues]
        );

        expenseId = result.insertId;
      }

      expenseIds[expense.key] = expenseId;

      // Rebuild only this seed expense's split rows.
      await conn.execute(
        'DELETE FROM expense_splits WHERE expense_id = ?',
        [expenseId]
      );

      const splitEntries = Object.entries(expense.splits);
      const splitTotal = splitEntries.reduce(
        (sum, [, amount]) => sum + amount,
        0
      );

      if (splitTotal !== expense.amount) {
        throw new Error(
          `Split total mismatch for ${expense.key}: ${splitTotal} != ${expense.amount}`
        );
      }

      for (const [member, shareAmount] of splitEntries) {
        await conn.execute(
          `INSERT INTO expense_splits
           (expense_id, user_id, share_amount, share_units, is_payer)
           VALUES (?, ?, ?, 1, ?)`,
          [
            expenseId,
            userIds[member],
            shareAmount,
            member === expense.payer ? 1 : 0,
          ]
        );

        if (approved && member !== expense.payer) {
          expenseContributions.push({
            room: expense.room,
            expenseId,
            debtor: userIds[member],
            creditor: payerId,
            amount: shareAmount,
          });
        }
      }

      // Approval records only for pending/rejected examples.
      await conn.execute(
        'DELETE FROM expense_approvals WHERE expense_id = ?',
        [expenseId]
      );

      if (expense.status === 'PENDING_APPROVAL') {
        await conn.execute(
          `INSERT INTO expense_approvals
           (expense_id, requested_from, requested_by, status)
           VALUES (?, ?, ?, 'PENDING')`,
          [
            expenseId,
            userIds[expense.requestedFrom],
            creatorId,
          ]
        );
      }

      if (expense.status === 'REJECTED') {
        await conn.execute(
          `INSERT INTO expense_approvals
           (expense_id, requested_from, requested_by, status,
            decided_by, decided_at, rejection_reason)
           VALUES (?, ?, ?, 'REJECTED', ?, NOW(), ?)`,
          [
            expenseId,
            userIds[expense.requestedFrom],
            creatorId,
            userIds[expense.requestedFrom],
            expense.rejectionReason,
          ]
        );
      }
    }

    console.log(`[demo] ${EXPENSES.length} expenses and splits ready.`);

    // 5. Generate realistic partial settlements from actual approved debts.
    for (const room of ROOMS) {
      const contributions = expenseContributions.filter(
        item => item.room === room.key
      );

      const debtMap = new Map();

      for (const item of contributions) {
        const key = `${item.debtor}:${item.creditor}`;

        if (!debtMap.has(key)) {
          debtMap.set(key, {
            debtor: item.debtor,
            creditor: item.creditor,
            amount: 0,
            contributions: [],
          });
        }

        const debt = debtMap.get(key);
        debt.amount += item.amount;
        debt.contributions.push(item);
      }

      const largestDebt = [...debtMap.values()]
        .sort((a, b) => b.amount - a.amount)[0];

      if (!largestDebt || largestDebt.amount < 2) continue;

      const settlementAmount = Math.floor(largestDebt.amount * 0.35);
      const settlementMarker = `${MARKER}:settlement:${room.key}`;
      const roomId = roomIds[room.key];

      const [existing] = await conn.execute(
        `SELECT id FROM settlements
         WHERE room_id = ? AND notes = ?
         LIMIT 1`,
        [roomId, settlementMarker]
      );

      let settlementId;

      if (existing.length) {
        settlementId = existing[0].id;

        await conn.execute(
          `UPDATE settlements
           SET payer_id = ?, receiver_id = ?, amount = ?,
               currency = 'INR', settled_at = ?, status = 'RECORDED',
               created_by = ?, notes = ?
           WHERE id = ?`,
          [
            largestDebt.debtor,
            largestDebt.creditor,
            settlementAmount,
            '2026-11-08',
            largestDebt.debtor,
            settlementMarker,
            settlementId,
          ]
        );
      } else {
        const [result] = await conn.execute(
          `INSERT INTO settlements
           (room_id, payer_id, receiver_id, amount, currency,
            settled_at, status, created_by, notes)
           VALUES (?, ?, ?, ?, 'INR', ?, 'RECORDED', ?, ?)`,
          [
            roomId,
            largestDebt.debtor,
            largestDebt.creditor,
            settlementAmount,
            '2026-11-08',
            largestDebt.debtor,
            settlementMarker,
          ]
        );

        settlementId = result.insertId;
      }

      await conn.execute(
        'DELETE FROM settlement_allocations WHERE settlement_id = ?',
        [settlementId]
      );

      let remaining = settlementAmount;

      for (const contribution of largestDebt.contributions) {
        if (remaining <= 0) break;

        const allocation = Math.min(
          remaining,
          contribution.amount
        );

        await conn.execute(
          `INSERT INTO settlement_allocations
           (settlement_id, expense_id, amount)
           VALUES (?, ?, ?)`,
          [settlementId, contribution.expenseId, allocation]
        );

        remaining -= allocation;
      }
    }

    console.log('[demo] Settlements and allocations ready.');

    // 6. Seed a few in-app notifications.
    const notificationRecords = [
      {
        user: 'sam',
        room: 'goa',
        type: 'APPROVAL_REQUESTED',
        title: 'Expense approval requested',
        body: 'Maya requested approval for Boat Cruise.',
        entityType: 'expense',
        expense: 'goa-boat',
        key: 'boat-approval',
      },
      {
        user: 'alex',
        room: 'goa',
        type: 'EXPENSE_ADDED',
        title: 'New expense added',
        body: 'Beach Resort Stay was added to Goa Trip 2026.',
        entityType: 'expense',
        expense: 'goa-hotel',
        key: 'hotel-added',
      },
      {
        user: 'maya',
        room: 'flat',
        type: 'SETTLEMENT_RECORDED',
        title: 'Payment recorded',
        body: 'A flat expense settlement has been recorded.',
        entityType: 'room',
        key: 'flat-settlement',
      },
    ];

    for (const item of notificationRecords) {
      const marker = `[${MARKER}:${item.key}]`;
      const body = `${item.body} ${marker}`;

      const [existing] = await conn.execute(
        `SELECT id FROM notifications
         WHERE user_id = ? AND body LIKE ?
         LIMIT 1`,
        [userIds[item.user], `%${marker}%`]
      );

      if (existing.length) {
        await conn.execute(
          `UPDATE notifications
           SET type = ?, title = ?, body = ?, room_id = ?,
               entity_type = ?, entity_id = ?
           WHERE id = ?`,
          [
            item.type,
            item.title,
            body,
            roomIds[item.room],
            item.entityType,
            item.expense ? expenseIds[item.expense] : null,
            existing[0].id,
          ]
        );
      } else {
        await conn.execute(
          `INSERT INTO notifications
           (user_id, type, title, body, entity_type, entity_id, room_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userIds[item.user],
            item.type,
            item.title,
            body,
            item.entityType,
            item.expense ? expenseIds[item.expense] : null,
            roomIds[item.room],
          ]
        );
      }
    }

    // 7. Seed room activity log entries.
    for (const expense of EXPENSES) {
      const marker = `${MARKER}:${expense.key}`;

      const [existing] = await conn.execute(
        `SELECT id FROM activity_logs
         WHERE room_id = ?
           AND JSON_UNQUOTE(JSON_EXTRACT(meta_json, '$.seedKey')) = ?
         LIMIT 1`,
        [roomIds[expense.room], marker]
      );

      if (!existing.length) {
        await conn.execute(
          `INSERT INTO activity_logs
           (room_id, actor_id, action, entity_type, entity_id, meta_json)
           VALUES (?, ?, ?, 'expense', ?, ?)`,
          [
            roomIds[expense.room],
            userIds[expense.creator],
            expense.status === 'APPROVED'
              ? 'EXPENSE_ADDED'
              : expense.status === 'PENDING_APPROVAL'
                ? 'APPROVAL_REQUESTED'
                : 'EXPENSE_REJECTED',
            expenseIds[expense.key],
            JSON.stringify({
              seedKey: marker,
              title: expense.title,
              status: expense.status,
            }),
          ]
        );
      }
    }

    await conn.commit();

    console.log('\n======================================');
    console.log('Demo data seeded successfully!');
    console.log('Users: 5');
    console.log('Rooms: 3');
    console.log(`Expenses: ${EXPENSES.length}`);
    console.log('Budget: Goa Trip 2026');
    console.log('Settlements: generated from approved expenses');
    console.log('Notifications and activity logs: ready');
    console.log('======================================\n');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.end();
  }
}

module.exports = { run };
