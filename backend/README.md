# Finance Management API

Backend API cho ứng dụng quản lý tài chính cá nhân được xây dựng với NestJS, Prisma, và PostgreSQL.

## 🚀 Tính năng

- **Authentication**: Đăng ký, đăng nhập với JWT
- **Transactions**: Quản lý thu chi (income/expense)
- **Categories**: Quản lý danh mục với parent-child relationships
- **Budgets**: Thiết lập và theo dõi ngân sách
- **Reports**: Báo cáo theo tháng, category, xu hướng
- **Export**: Xuất dữ liệu ra JSON/CSV

## 📋 Yêu cầu

- Node.js >= 18
- PostgreSQL >= 14
- npm hoặc yarn

## 🛠️ Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd backend

# Cài đặt dependencies
npm install

# Copy file .env
cp .env.example .env

# Sửa DATABASE_URL và JWT_SECRET trong .env

# Chạy migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

## 🏃 Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `GET /auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /users/me` - Thông tin profile
- `PATCH /users/me` - Cập nhật profile
- `GET /users/stats` - Thống kê của user

### Transactions
- `POST /transactions` - Tạo giao dịch mới
- `GET /transactions` - Lấy danh sách (có filter)
- `GET /transactions/stats` - Thống kê thu chi
- `GET /transactions/:id` - Chi tiết giao dịch
- `PATCH /transactions/:id` - Cập nhật giao dịch
- `DELETE /transactions/:id` - Xóa giao dịch

### Categories
- `POST /categories` - Tạo category
- `GET /categories` - Danh sách categories
- `GET /categories/:id` - Chi tiết category
- `PATCH /categories/:id` - Cập nhật category
- `DELETE /categories/:id` - Xóa category

### Budgets
- `POST /budgets` - Tạo budget
- `GET /budgets` - Danh sách budgets
- `GET /budgets/:id` - Chi tiết budget
- `PATCH /budgets/:id` - Cập nhật budget
- `DELETE /budgets/:id` - Xóa budget

### Reports
- `GET /reports/monthly` - Báo cáo theo tháng
- `GET /reports/category/:categoryId` - Báo cáo theo category
- `GET /reports/trend` - Báo cáo xu hướng
- `GET /reports/budget` - Báo cáo budget

### Export
- `GET /export/transactions` - Export giao dịch
- `GET /export/budgets` - Export budgets
- `GET /export/categories` - Export categories
- `GET /export/full` - Export toàn bộ dữ liệu

## 🏗️ Cấu trúc thư mục

```
src/
├── auth/           # Authentication & JWT
├── budgets/        # Quản lý ngân sách
├── categories/     # Quản lý danh mục
├── common/         # Shared utilities
├── export/         # Export data
├── prisma/         # Prisma service
├── reports/        # Báo cáo
├── transactions/   # Quản lý giao dịch
├── users/          # Quản lý user
├── app.module.ts
└── main.ts
```

## 🔧 Scripts

```bash
# Development
npm run start:dev

# Build
npm run build

# Format code
npm run format

# Lint
npm run lint

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
