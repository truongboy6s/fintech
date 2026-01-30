# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Tất cả endpoints (trừ `/auth/register` và `/auth/login`) yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### POST /auth/register
Đăng ký tài khoản mới

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### POST /auth/login
Đăng nhập

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Giống register

### GET /auth/me
Lấy thông tin user hiện tại

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-01-30T00:00:00.000Z"
}
```

---

## 💰 Transactions Endpoints

### POST /transactions
Tạo giao dịch mới

**Body:**
```json
{
  "amount": 50000,
  "description": "Mua cafe",
  "type": "EXPENSE",
  "date": "2026-01-30",
  "categoryId": "category-uuid"
}
```

### GET /transactions
Lấy danh sách giao dịch

**Query params:**
- `type`: INCOME | EXPENSE
- `categoryId`: UUID
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Example:** `/transactions?type=EXPENSE&startDate=2026-01-01&endDate=2026-01-31`

### GET /transactions/stats
Thống kê thu chi

**Query params:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response:**
```json
{
  "totalIncome": 10000000,
  "totalExpense": 5000000,
  "balance": 5000000,
  "recentTransactions": [...]
}
```

### GET /transactions/:id
Chi tiết giao dịch

### PATCH /transactions/:id
Cập nhật giao dịch

**Body:** Các trường muốn update (tương tự POST)

### DELETE /transactions/:id
Xóa giao dịch

---

## 📁 Categories Endpoints

### POST /categories
Tạo category mới

**Body:**
```json
{
  "name": "Food & Drink",
  "icon": "🍔",
  "color": "#FF5733",
  "type": "EXPENSE",
  "parentId": "parent-uuid-optional"
}
```

### GET /categories
Lấy danh sách categories

**Query params:**
- `type`: INCOME | EXPENSE

### GET /categories/:id
Chi tiết category (bao gồm transactions và budgets)

### PATCH /categories/:id
Cập nhật category

### DELETE /categories/:id
Xóa category (không được có transactions, budgets, hoặc subcategories)

---

## 💵 Budgets Endpoints

### POST /budgets
Tạo budget mới

**Body:**
```json
{
  "name": "Food Budget Jan 2026",
  "amount": 5000000,
  "period": "MONTH",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "alertThreshold": 80,
  "categoryId": "category-uuid"
}
```

**period:** WEEK | MONTH | YEAR

### GET /budgets
Lấy danh sách budgets (kèm spent, remaining, percentage)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Food Budget Jan 2026",
    "amount": 5000000,
    "spent": 3500000,
    "remaining": 1500000,
    "percentage": 70,
    "category": {...}
  }
]
```

### GET /budgets/:id
Chi tiết budget

### PATCH /budgets/:id
Cập nhật budget

### DELETE /budgets/:id
Xóa budget

---

## 📊 Reports Endpoints

### GET /reports/monthly
Báo cáo theo tháng

**Query params:**
- `year`: 2026
- `month`: 1-12

**Response:**
```json
{
  "period": {
    "year": 2026,
    "month": 1,
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "summary": {
    "totalIncome": 10000000,
    "totalExpense": 5000000,
    "balance": 5000000,
    "transactionCount": 50
  },
  "categoryBreakdown": [...],
  "transactions": [...]
}
```

### GET /reports/category/:categoryId
Báo cáo theo category

**Query params:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

### GET /reports/trend
Báo cáo xu hướng (mặc định 6 tháng)

**Query params:**
- `months`: number (default: 6)

**Response:**
```json
[
  {
    "year": 2025,
    "month": 8,
    "income": 10000000,
    "expense": 7000000,
    "balance": 3000000
  },
  ...
]
```

### GET /reports/budget
Báo cáo budget vs thực tế

**Response:**
```json
[
  {
    "budget": {...},
    "spent": 3500000,
    "remaining": 1500000,
    "percentage": 70,
    "status": "good" | "warning" | "exceeded"
  }
]
```

---

## 📤 Export Endpoints

### GET /export/transactions
Export giao dịch

**Query params:**
- `format`: json | csv
- `startDate`, `endDate`, `type`, `categoryId`

### GET /export/budgets
Export budgets

**Query params:**
- `format`: json | csv

### GET /export/categories
Export categories

**Query params:**
- `format`: json | csv

### GET /export/full
Export toàn bộ dữ liệu (JSON)

**Response:**
```json
{
  "exportDate": "2026-01-30T...",
  "user": {...},
  "data": {
    "transactions": [...],
    "budgets": [...],
    "categories": [...]
  },
  "stats": {
    "transactionCount": 100,
    "budgetCount": 5,
    "categoryCount": 10
  }
}
```

---

## 👤 Users Endpoints

### GET /users/me
Lấy thông tin profile

### PATCH /users/me
Cập nhật profile

**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### GET /users/stats
Thống kê của user

**Response:**
```json
{
  "transactionCount": 100,
  "categoryCount": 15,
  "budgetCount": 5
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["field1 must be a string", "field2 is required"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```
