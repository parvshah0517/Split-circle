# SplitCircle — Group Expense Sharing Platform

> A modern, full-stack group expense-sharing app inspired by Splitwise. Built with React + Node.js + Express + MySQL.

---

## Project Structure

```
Splitcircle/
├── backend/         Express.js REST API + MySQL
└── frontend/        React.js (coming in Phase 13)
```

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm 9+

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DB_PASSWORD` — your MySQL root password
- `DB_USER` — your MySQL user (default: `root`)
- `JWT_SECRET` — any long random string for production

### 3. Run database migrations

```bash
npm run migrate
```

This creates the `splitcircle` database and all 14 tables.

### 4. Seed categories

```bash
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

Server runs at: http://localhost:3001

Health check: http://localhost:3001/health

---

## Implementation Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Architecture + DB schema | ✅ Done |
| 2 | Backend setup + migrations | ✅ Done |
| 3 | Authentication (JWT) | 🔜 Next |
| 4 | Room management | ⬜ |
| 5 | Expense creation + splits | ⬜ |
| 6 | Proxy expense + approval | ⬜ |
| 7 | Balance calculation | ⬜ |
| 8 | Settlements | ⬜ |
| 9 | Room budgets | ⬜ |
| 10 | Document storage | ⬜ |
| 11 | Notifications + activity | ⬜ |
| 12 | React frontend | ⬜ |
| Future | AWS CDK + GitHub Actions | 🔒 |

---

## Key Technical Decisions

- **Integer minor units** — all monetary amounts stored as paise/cents (no floating-point)
- **Largest-remainder rounding** — split totals always equal the expense amount exactly
- **Storage abstraction** — `LocalStorageAdapter` for dev, swappable to `S3Adapter` for AWS
- **Debt simplification** — greedy min-transfer algorithm
- **Approval workflow** — proxy expenses and expense edits require approval before affecting balances
