# PHÂN TÍCH CẤU TRÚC DỰ ÁN VÀ QUAN HỆ NGHIỆP VỤ

## 📁 TỔNG QUAN CẤU TRÚC DỰ ÁN

### 1. Kiến trúc hệ thống
Dự án được xây dựng theo kiến trúc **Client-Server** với:
- **Backend**: NestJS (Node.js framework) - REST API
- **Frontend**: React Native với Expo Router - Mobile Application
- **Database**: PostgreSQL với Prisma ORM

---

## 🏗️ CẤU TRÚC BACKEND (NestJS)

### 📂 Cấu trúc thư mục chính

```
backend/
├── prisma/                      # Database schema và migrations
│   ├── schema.prisma           # Định nghĩa cấu trúc database
│   └── migrations/             # Lịch sử migration
│
├── generated/prisma/           # Prisma Client tự động sinh
│   ├── models.ts              # Type definitions cho models
│   ├── enums.ts               # Enumerations
│   └── ...
│
└── src/
    ├── main.ts                 # Entry point của ứng dụng
    ├── app.module.ts           # Root module
    │
    ├── auth/                   # Module xác thực người dùng
    │   ├── auth.controller.ts  # Endpoints: login, register
    │   ├── auth.service.ts     # Business logic xác thực
    │   ├── jwt.strategy.ts     # JWT authentication strategy
    │   └── dto/                # Data Transfer Objects
    │
    ├── users/                  # Module quản lý người dùng
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── users.module.ts
    │
    ├── categories/             # Module quản lý danh mục
    │   ├── categories.controller.ts
    │   ├── categories.service.ts
    │   └── dto/
    │
    ├── transactions/           # Module quản lý giao dịch
    │   ├── transactions.controller.ts
    │   ├── transactions.service.ts
    │   └── dto/
    │
    ├── budgets/                # Module quản lý ngân sách (chưa triển khai)
    │   ├── budgets.controller.ts
    |   ├── budgets.service.ts
    │   └── dto/
    ├── reports/                # Module báo cáo tài chính
    │   ├── reports.controller.ts
    │   ├── reports.service.ts
    │   └── reports.module.ts
    │
    ├── export/                 # Module xuất dữ liệu
    │   ├── export.controller.ts
    │   ├── export.service.ts
    │   └── export.module.ts
    │
    ├── prisma/                 # Prisma service module
    │   ├── prisma.service.ts   # Database connection service
    │   └── prisma.module.ts
    │
    └── common/                 # Shared utilities
        ├── constants/          # Hằng số ứng dụng
        ├── decorators/         # Custom decorators
        ├── filters/            # Exception filters
        ├── guards/             # Authentication guards
        └── interceptors/       # Request/Response interceptors
```

### 🔧 Công nghệ và thư viện Backend

- **Framework**: NestJS 10.0
- **ORM**: Prisma 7.3.0
- **Authentication**: JWT (@nestjs/jwt, passport-jwt)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
- **Language**: TypeScript 5.1

---

## 📱 CẤU TRÚC FRONTEND (React Native + Expo)

### 📂 Cấu trúc thư mục chính

```
frontend/
├── app/                        # Expo Router - File-based routing
│   ├── _layout.tsx            # Root layout
│   ├── modal.tsx              # Modal screens
│   │
│   ├── (auth)/                # Authentication flow (Group route)
│   │   ├── _layout.tsx        # Auth layout
│   │   ├── login.tsx          # Màn hình đăng nhập
│   │   └── register.tsx       # Màn hình đăng ký
│   │
│   ├── (tabs)/                # Tab navigation (Main app)
│   │   ├── index.tsx          # Home/Dashboard tab
│   │   ├── budget.tsx         # Budget management tab
│   │   ├── reports.tsx        # Reports tab
│   │   └── profile.tsx        # Profile tab
│   │
│   ├── add-expense.tsx        # Màn hình thêm chi tiêu
│   ├── add-income.tsx         # Màn hình thêm thu nhập
│   ├── add-category.tsx       # Màn hình thêm danh mục
│   └── export.tsx             # Màn hình xuất dữ liệu
│
├── components/                 # React components
│   ├── BudgetProgress.tsx     # Component hiển thị tiến độ ngân sách
│   ├── CategoryItem.tsx       # Component item danh mục
│   ├── ChartCard.tsx          # Component biểu đồ
│   ├── TransactionItem.tsx    # Component item giao dịch
│   └── ui/                    # UI components (buttons, inputs, etc.)
│
├── services/                   # API services
│   ├── api.ts                 # Axios instance configuration
│   ├── auth.service.ts        # Authentication API calls
│   ├── budget.service.ts      # Budget API calls
│   ├── transaction.service.ts # Transaction API calls
│   └── report.service.ts      # Report API calls
│
├── store/                      # Redux state management
│   ├── index.ts               # Store configuration
│   ├── hooks.ts               # Typed Redux hooks
│   └── slices/                # Redux slices
│       ├── authSlice.ts       # Authentication state
│       ├── budgetSlice.ts     # Budget state
│       └── transactionSlice.ts # Transaction state
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts             # Hook quản lý authentication
│   ├── useDebounce.ts         # Hook debounce
│   ├── use-color-scheme.ts    # Hook theme
│   └── use-theme-color.ts     # Hook màu sắc theo theme
│
├── utils/                      # Utility functions
│   ├── formatCurrency.ts      # Format tiền tệ
│   ├── formatDate.ts          # Format ngày tháng
│   └── exportFile.ts          # Export file utilities
│
├── constants/                  # Constants
│   ├── colors.ts              # Định nghĩa màu sắc
│   ├── spacing.ts             # Spacing system
│   ├── theme.ts               # Theme configuration
│   └── categories.ts          # Default categories
│
└── assets/                     # Static assets
    ├── icons/                 # Icon files
    └── images/                # Image files
```

### 🔧 Công nghệ và thư viện Frontend

- **Framework**: React Native 0.81.5
- **Router**: Expo Router 6.0
- **State Management**: Redux Toolkit 2.11.2, React Redux 9.2.0
- **HTTP Client**: Axios 1.13.3
- **Navigation**: React Navigation 7.x
- **Storage**: Expo Secure Store (token storage)
- **UI**: Expo Vector Icons, Custom components

---

## 🗄️ DATABASE SCHEMA VÀ QUAN HỆ NGHIỆP VỤ

### 1️⃣ MODEL: User (Người dùng)

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  password     String        // Hashed password
  isVerified   Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  // Relationships
  budgets      Budget[]      // Một user có nhiều budget
  categories   Category[]    // Một user có nhiều category
  transactions Transaction[] // Một user có nhiều transaction
}
```

**Vai trò nghiệp vụ:**
- Đại diện cho người dùng hệ thống
- Mỗi user quản lý riêng dữ liệu của mình (budgets, categories, transactions)

---

### 2️⃣ MODEL: Category (Danh mục)

```prisma
model Category {
  id           String        @id @default(uuid())
  name         String        // Tên danh mục (VD: "Ăn uống", "Lương")
  icon         String?       // Icon đại diện
  color        String?       // Màu sắc
  type         CategoryType  // INCOME hoặc EXPENSE
  userId       String        // Foreign key -> User
  parentId     String?       // Self-referencing cho category cha
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  // Relationships
  budgets      Budget[]      // Một category có nhiều budget
  parent       Category?     @relation("CategoryParent", fields: [parentId], references: [id])
  children     Category[]    @relation("CategoryParent")
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[] // Một category có nhiều transaction
}

enum CategoryType {
  INCOME   // Thu nhập
  EXPENSE  // Chi tiêu
}
```

**Vai trò nghiệp vụ:**
- Phân loại giao dịch thu/chi
- Hỗ trợ cấu trúc phân cấp (parent-child): VD: "Chi tiêu" > "Ăn uống" > "Nhà hàng"
- Mỗi user tạo và quản lý categories riêng
- Dùng để gom nhóm transactions và tạo budgets

**Mối quan hệ:**
- **User** (1-N): Một user có nhiều categories
- **Category** (Self-referencing): Parent-Child relationship
- **Transaction** (1-N): Một category có nhiều transactions
- **Budget** (1-N): Một category có nhiều budgets

---

### 3️⃣ MODEL: Transaction (Giao dịch)

```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Float           // Số tiền giao dịch
  description String?         // Mô tả
  type        TransactionType // INCOME hoặc EXPENSE
  date        DateTime        // Ngày giao dịch
  userId      String          // Foreign key -> User
  categoryId  String          // Foreign key -> Category
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  
  // Relationships
  category    Category        @relation(fields: [categoryId], references: [id])
  user        User            @relation(fields: [userId], references: [id])
}

enum TransactionType {
  INCOME   // Thu nhập
  EXPENSE  // Chi tiêu
}
```

**Vai trò nghiệp vụ:**
- Lưu trữ các giao dịch tài chính (thu/chi) của user
- Gắn với category để phân loại
- Có thể filter theo ngày, type, category
- Dùng để tính toán báo cáo, theo dõi chi tiêu

**Mối quan hệ:**
- **User** (N-1): Nhiều transactions thuộc một user
- **Category** (N-1): Nhiều transactions thuộc một category

**Business Logic:**
- Khi tạo transaction EXPENSE → cập nhật spent trong Budget tương ứng
- Transaction có thể export ra file (CSV, Excel)
- Dùng để tạo reports theo thời gian, category

---

### 4️⃣ MODEL: Budget (Ngân sách)

```prisma
model Budget {
  id             String       @id @default(uuid())
  name           String       // Tên ngân sách
  amount         Float        // Số tiền ngân sách dự kiến
  spent          Float        @default(0) // Số tiền đã chi
  period         BudgetPeriod // WEEK, MONTH, YEAR
  startDate      DateTime     // Ngày bắt đầu
  endDate        DateTime     // Ngày kết thúc
  alertThreshold Float?       // Ngưỡng cảnh báo (VD: 80% budget)
  userId         String       // Foreign key -> User
  categoryId     String       // Foreign key -> Category
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  // Relationships
  category       Category     @relation(fields: [categoryId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
}

enum BudgetPeriod {
  WEEK   // Ngân sách theo tuần
  MONTH  // Ngân sách theo tháng
  YEAR   // Ngân sách theo năm
}
```

**Vai trò nghiệp vụ:**
- Quản lý ngân sách theo category và thời gian
- Theo dõi chi tiêu thực tế (spent) so với dự kiến (amount)
- Cảnh báo khi vượt ngưỡng (alertThreshold)
- Hỗ trợ lập kế hoạch tài chính

**Mối quan hệ:**
- **User** (N-1): Nhiều budgets thuộc một user
- **Category** (N-1): Nhiều budgets thuộc một category

**Business Logic:**
- `spent` được tự động cập nhật khi có transaction EXPENSE trong category tương ứng
- `progress = (spent / amount) * 100%`
- Alert khi: `spent >= (amount * alertThreshold / 100)`

---

## 📊 BIỂU ĐỒ QUAN HỆ DATABASE (ERD)

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email (unique)  │
│ name            │
│ password        │
│ isVerified      │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N (owns)
         │
    ┌────┴──────────────────────────────┐
    │                                   │
    │                                   │
┌───▼──────────────┐            ┌──────▼──────────┐
│    Category      │            │   Transaction   │
│──────────────────│            │─────────────────│
│ id (PK)          │◄───────────┤ id (PK)         │
│ name             │   N:1      │ amount          │
│ icon             │  (belongs) │ description     │
│ color            │            │ type            │
│ type (enum)      │            │ date            │
│ userId (FK)      │            │ userId (FK)     │
│ parentId (FK)    │            │ categoryId (FK) │
│ createdAt        │            │ createdAt       │
│ updatedAt        │            │ updatedAt       │
└───┬──────────────┘            └─────────────────┘
    │         ▲
    │ Self    │
    │ Ref     │
    └─────────┘
    │
    │ 1:N (has)
    │
┌───▼──────────────┐
│     Budget       │
│──────────────────│
│ id (PK)          │
│ name             │
│ amount           │
│ spent            │
│ period (enum)    │
│ startDate        │
│ endDate          │
│ alertThreshold   │
│ userId (FK)      │
│ categoryId (FK)  │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

---

## 🔄 LUỒNG NGHIỆP VỤ CHÍNH

### 1. Authentication Flow

```
User Registration:
1. User nhập email, name, password
2. Backend hash password bằng bcrypt
3. Tạo User mới trong database (isVerified = false)
4. Trả về JWT token
5. Frontend lưu token vào SecureStore

User Login:
1. User nhập email, password
2. Backend verify password
3. Tạo JWT token
4. Frontend lưu token và redirect đến Home
```

### 2. Transaction Management Flow

```
Create Transaction:
1. User chọn Type (INCOME/EXPENSE)
2. User chọn Category
3. User nhập amount, description, date
4. Frontend gửi POST /transactions
5. Backend tạo Transaction
6. Nếu type = EXPENSE:
   - Tìm Budget tương ứng (categoryId, period)
   - Cập nhật Budget.spent += amount
   - Kiểm tra alertThreshold
7. Frontend refresh danh sách transactions

View Transactions:
1. Frontend gửi GET /transactions?startDate=X&endDate=Y
2. Backend filter transactions theo user, date range
3. Group by category, type
4. Trả về danh sách + tổng thu/chi
```

### 3. Budget Management Flow

```
Create Budget:
1. User chọn Category (type = EXPENSE)
2. User nhập amount, period, date range
3. Frontend gửi POST /budgets
4. Backend tạo Budget (spent = 0)
5. Backend tính toán spent từ transactions hiện có:
   - Filter transactions: categoryId, startDate-endDate, type=EXPENSE
   - Sum amount
   - Update Budget.spent

Monitor Budget:
1. Frontend định kỳ gọi GET /budgets
2. Backend trả về budgets với:
   - progress = (spent/amount) * 100
   - isOverBudget = spent > amount
   - shouldAlert = spent >= (amount * alertThreshold/100)
3. Frontend hiển thị progress bar, alert nếu cần
```

### 4. Reporting Flow

```
Generate Report:
1. User chọn date range, report type
2. Frontend gọi GET /reports?type=X&startDate=Y&endDate=Z
3. Backend:
   - Query transactions theo filter
   - Group by category, type, date
   - Tính toán:
     * Total income/expense
     * Balance = income - expense
     * Top spending categories
     * Trends theo thời gian
4. Frontend hiển thị charts và tables
```

### 5. Category Management Flow

```
Create Category:
1. User nhập name, chọn type, icon, color
2. Optional: chọn parent category (cho subcategory)
3. Frontend gửi POST /categories
4. Backend validate và tạo Category
5. User có thể dùng category này cho transactions/budgets

Category Hierarchy:
Parent: "Chi tiêu"
  ├─ Child: "Ăn uống"
  │    ├─ Grandchild: "Nhà hàng"
  │    └─ Grandchild: "Cafe"
  └─ Child: "Di chuyển"
       ├─ Grandchild: "Xăng xe"
       └─ Grandchild: "Gửi xe"
```

---

## 🔐 SECURITY & AUTHENTICATION

### JWT Strategy
- **Token Generation**: Khi login thành công
- **Token Storage**: Expo SecureStore (encrypted)
- **Token Usage**: Gửi trong header: `Authorization: Bearer <token>`
- **Protected Routes**: Middleware kiểm tra JWT ở backend
- **Token Expiration**: Cần implement refresh token mechanism

### Password Security
- **Hashing**: bcrypt với salt rounds
- **Never stored plain text**
- **Validation**: Min length, complexity requirements

---

## 📈 TÍNH NĂNG CHÍNH

### ✅ Đã triển khai (dự kiến)
1. ✅ Authentication (Login/Register)
2. ✅ Category Management (CRUD)
3. ✅ Transaction Management (CRUD)
4. ✅ Budget Tracking
5. ✅ Reports & Analytics
6. ✅ Data Export (CSV/Excel)

### 🔨 Đang phát triển
- Budget module (backend chưa hoàn chỉnh)
- Advanced reports
- Notifications/Alerts
- Multi-currency support

### 🎯 Có thể mở rộng
- Recurring transactions (giao dịch định kỳ)
- Budget templates
- Goal tracking (tiết kiệm mục tiêu)
- Family/shared budgets
- Receipt scanning (OCR)
- Bank account integration
- AI-powered insights

---

## 🎨 UI/UX PATTERNS

### Navigation Structure
```
App
├── (auth) - Stack Navigator
│   ├── login
│   └── register
│
└── (tabs) - Bottom Tab Navigator
    ├── index (Home/Dashboard)
    │   - Hiển thị tổng quan: balance, recent transactions
    │   - Quick actions: add income/expense
    │
    ├── transactions
    │   - Danh sách transactions
    │   - Filter by date, category, type
    │
    ├── budgets
    │   - Danh sách budgets với progress
    │   - Add/Edit budget
    │
    ├── reports
    │   - Charts: pie, bar, line
    │   - Export functionality
    │
    └── profile
        - User info
        - Categories management
        - Settings
        - Logout
```

### State Management Strategy
- **Redux Slices**:
  - `authSlice`: user info, token, isAuthenticated
  - `transactionSlice`: transactions list, filters, totals
  - `budgetSlice`: budgets list, progress, alerts
  - `categorySlice`: categories tree

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### Backend
- Environment variables: DATABASE_URL, JWT_SECRET
- Prisma migrations trước khi deploy
- CORS configuration cho frontend domain
- Rate limiting cho APIs
- Logging và monitoring

### Frontend
- Build cho Android/iOS
- API base URL configuration
- Error handling và offline support
- Analytics integration

---

## 📝 TÓM TẮT QUAN HỆ NGHIỆP VỤ

| Đối tượng | Quan hệ với | Loại quan hệ | Ý nghĩa nghiệp vụ |
|-----------|-------------|--------------|-------------------|
| **User** | Category | 1:N | Mỗi user tạo và quản lý categories riêng |
| **User** | Transaction | 1:N | Mỗi user có nhiều transactions |
| **User** | Budget | 1:N | Mỗi user có nhiều budgets |
| **Category** | Category | Self-ref (1:N) | Category có thể có subcategories |
| **Category** | Transaction | 1:N | Category phân loại transactions |
| **Category** | Budget | 1:N | Budget áp dụng cho một category |
| **Transaction** | Budget | Indirect | Transactions EXPENSE cập nhật Budget.spent |

### Key Business Rules:
1. **Isolation**: Mỗi user chỉ thấy dữ liệu của mình
2. **Type Matching**: Transaction.type phải match với Category.type
3. **Budget Calculation**: Budget.spent = SUM(Transactions.amount) WHERE categoryId = Budget.categoryId AND date BETWEEN Budget.startDate AND Budget.endDate
4. **Category Hierarchy**: Có thể report theo parent category (tổng hợp tất cả children)
5. **Data Integrity**: Xóa User → cascade delete tất cả dữ liệu liên quan

---

## 🔍 API ENDPOINTS (Dự kiến)

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

### Users
- `GET /users/profile` - Xem profile
- `PATCH /users/profile` - Cập nhật profile

### Categories
- `GET /categories` - Danh sách categories
- `POST /categories` - Tạo category mới
- `PATCH /categories/:id` - Cập nhật category
- `DELETE /categories/:id` - Xóa category

### Transactions
- `GET /transactions` - Danh sách transactions (với filters)
- `GET /transactions/:id` - Chi tiết transaction
- `POST /transactions` - Tạo transaction mới
- `PATCH /transactions/:id` - Cập nhật transaction
- `DELETE /transactions/:id` - Xóa transaction

### Budgets
- `GET /budgets` - Danh sách budgets
- `GET /budgets/:id` - Chi tiết budget
- `POST /budgets` - Tạo budget mới
- `PATCH /budgets/:id` - Cập nhật budget
- `DELETE /budgets/:id` - Xóa budget
- `GET /budgets/:id/progress` - Tiến độ budget

### Reports
- `GET /reports/summary` - Tổng quan thu chi
- `GET /reports/by-category` - Báo cáo theo danh mục
- `GET /reports/trends` - Xu hướng theo thời gian

### Export
- `POST /export/transactions` - Export transactions
- `POST /export/report` - Export report

---

*Document created: January 29, 2026*  
*Version: 1.0*  
*Author: Financial Management System Analysis*
