# Inventory Management

## 1. Tổng quan dự án

Đây là hệ thống quản lý kho hàng gồm:

- Frontend viết bằng React và Vite.
- Backend viết bằng Node.js và Express.
- Database PostgreSQL.
- Giao diện sử dụng Material UI.
- Xác thực bằng access token và refresh token.
- Phân quyền theo vai trò người dùng.

Kiến trúc chính:

```text
Frontend
  React Page
    Component
      API Service
        Backend API

Backend
  Route
    Middleware
      Controller
        Service
          Repository
            PostgreSQL
```

## 2. Những chức năng đã hoàn thành

### Xác thực và tài khoản

- Đăng ký tài khoản.
- Đăng nhập.
- Đăng xuất.
- Mã hóa mật khẩu bằng Argon2.
- Tạo và kiểm tra access token.
- Tạo, lưu trữ, xoay vòng và thu hồi refresh token.
- Tự động refresh access token khi token hết hạn.
- Lưu trạng thái đăng nhập ở Frontend.
- Chuyển hướng người dùng chưa đăng nhập về trang Login.

### Phân quyền

- Vai trò `admin` có thể:
  - Thêm sản phẩm.
  - Cập nhật sản phẩm.
  - Tạo phiếu nhập.
  - Xác nhận phiếu nhập.
- Người dùng thông thường có thể xem danh sách sản phẩm.
- Backend kiểm tra quyền bằng middleware `requireRoles`.

### Quản lý sản phẩm

- Xem danh sách sản phẩm.
- Thêm sản phẩm.
- Cập nhật sản phẩm.
- Kiểm tra tên, SKU, danh mục và nhà cung cấp.
- Kiểm tra giá không âm.
- Kiểm tra tồn kho là số nguyên không âm.
- Lưu sản phẩm trong PostgreSQL.
- Hiển thị thống kê:
  - Tổng số sản phẩm.
  - Sản phẩm sắp hết hàng.
  - Sản phẩm hết hàng.

### Quản lý phiếu nhập

- Tạo phiếu nhập nháp.
- Thêm nhiều sản phẩm vào phiếu nhập.
- Kiểm tra sản phẩm không bị trùng trong cùng một phiếu.
- Kiểm tra số lượng nhập là số nguyên dương.
- Xác nhận phiếu nhập.
- Cộng số lượng vào tồn kho sau khi xác nhận.
- Ghi lịch sử biến động kho vào `stock_movements`.
- Dùng transaction PostgreSQL để bảo đảm dữ liệu nhất quán.
- Khóa dữ liệu khi xác nhận để tránh xác nhận trùng đồng thời.

### Giao diện và trải nghiệm

- Giao diện đăng nhập.
- Giao diện đăng ký.
- Giao diện quản lý sản phẩm.
- Form thêm và sửa sản phẩm.
- Bảng danh sách sản phẩm.
- Hộp thoại xác nhận đăng xuất.
- Thông báo thành công và lỗi.
- Hiển thị trạng thái đang xử lý để tránh gửi request trùng.
- Responsive layout bằng Material UI.

## 3. Cấu trúc thư mục tổng thể

```text
inventory-template/
├── PROJECT_DESCRIPTION.md
├── README.md
├── client/
└── server/
```

## 4. Cấu trúc Frontend

Thư mục Frontend: `client/`

```text
client/
├── index.html
├── package.json
├── eslint.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── app/
    │   └── theme.js
    │
    ├── auth/
    │   ├── AuthContext.js
    │   ├── AuthProvider.jsx
    │   └── useAuth.js
    │
    ├── components/
    │   ├── MainLayout.jsx
    │   ├── auth/
    │   │   └── AuthLayout.jsx
    │   └── products/
    │       ├── ProductForm.jsx
    │       ├── ProductRow.jsx
    │       ├── ProductTable.jsx
    │       ├── StatCard.jsx
    │       └── StatCard.css
    │
    ├── notifications/
    │   ├── NotificationProvider.jsx
    │   └── useNotification.js
    │
    ├── pages/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── ProductsPage.jsx
    │
    └── services/
        ├── apiClient.js
        ├── authApi.js
        └── productApi.js
```

### Nhiệm vụ của các nhóm file Frontend

#### File khởi động và cấu hình

- `main.jsx`: tạo React root và render ứng dụng.
- `App.jsx`: cấu hình React Router, ThemeProvider và AuthProvider.
- `index.css`: CSS toàn cục.
- `theme.js`: cấu hình theme Material UI.
- `vite.config.js`: cấu hình Vite.

#### `auth/`

- `AuthContext.js`: tạo context chứa trạng thái xác thực.
- `AuthProvider.jsx`: quản lý user, access token, login, logout và refresh token.
- `useAuth.js`: hook để các component sử dụng AuthContext.

#### `pages/`

- `Login.jsx`: form đăng nhập.
- `Register.jsx`: form đăng ký.
- `ProductsPage.jsx`: tải, hiển thị, thêm và cập nhật sản phẩm.

#### `components/`

- `MainLayout.jsx`: layout chính sau khi đăng nhập.
- `AuthLayout.jsx`: layout dùng chung cho Login và Register.
- `ProductForm.jsx`: form nhập dữ liệu sản phẩm.
- `ProductTable.jsx`: bảng danh sách sản phẩm.
- `ProductRow.jsx`: hiển thị từng sản phẩm.
- `StatCard.jsx`: hiển thị số liệu thống kê.

#### `services/`

- `apiClient.js`: gửi request có access token và tự retry sau khi refresh token.
- `authApi.js`: gọi các API đăng ký, đăng nhập, refresh và logout.
- `productApi.js`: gọi API lấy, thêm và cập nhật sản phẩm.

#### `notifications/`

- `NotificationProvider.jsx`: cung cấp hệ thống thông báo.
- `useNotification.js`: hook để hiển thị thông báo.

## 5. Cấu trúc Backend

Thư mục Backend: `server/`

```text
server/
├── package.json
├── eslint.config.js
├── test-db.js
└── src/
    ├── app.js
    ├── server.js
    ├── container.js
    ├── db.js
    │
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── product.controller.js
    │   └── goodsReceiptController.js
    │
    ├── middlewares/
    │   ├── errorHandler.js
    │   ├── loadCurrentUser.js
    │   ├── notFound.js
    │   ├── requireLogin.js
    │   └── requireRoles.js
    │
    ├── repositories/
    │   ├── user.repository.js
    │   ├── refreshToken.repository.js
    │   ├── product.repository.js
    │   └── goodsReceipt.repository.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── product.routes.js
    │   └── goodsReceipt.routes.js
    │
    ├── services/
    │   ├── auth.service.js
    │   ├── product.service.js
    │   └── goodsReceipt.service.js
    │
    └── utils/
        ├── token.js
        └── refreshToken.js
```

### Nhiệm vụ của các nhóm file Backend

#### File khởi động và cấu hình

- `server.js`: khởi động HTTP server.
- `app.js`: tạo Express app, cấu hình CORS, JSON body, cookie và routes.
- `db.js`: tạo kết nối PostgreSQL bằng `pg`.
- `container.js`: khởi tạo repository, service, controller và inject dependency.
- `test-db.js`: kiểm tra kết nối database.

#### `routes/`

Định nghĩa endpoint và gắn middleware:

- `auth.routes.js`:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
- `product.routes.js`:
  - `GET /api/products`
  - `POST /api/products`
  - `PUT /api/products/:id`
- `goodsReceipt.routes.js`:
  - `POST /api/goods-receipts`
  - `POST /api/goods-receipts/:id/confirm`

#### `controllers/`

Nhận request từ route, gọi service và trả response:

- `auth.controller.js`: xử lý đăng ký, đăng nhập, refresh và logout.
- `product.controller.js`: xử lý lấy, thêm và cập nhật sản phẩm.
- `goodsReceiptController.js`: xử lý tạo và xác nhận phiếu nhập.

#### `services/`

Chứa business logic và validation:

- `auth.service.js`: kiểm tra tài khoản, mã hóa mật khẩu và xử lý token.
- `product.service.js`: kiểm tra và xử lý dữ liệu sản phẩm.
- `goodsReceipt.service.js`: kiểm tra phiếu nhập và các dòng sản phẩm.

#### `repositories/`

Chịu trách nhiệm truy vấn PostgreSQL:

- `user.repository.js`: truy vấn người dùng.
- `refreshToken.repository.js`: lưu và quản lý refresh token.
- `product.repository.js`: truy vấn sản phẩm.
- `goodsReceipt.repository.js`: tạo phiếu nhập, cập nhật tồn kho và lưu lịch sử kho.

#### `middlewares/`

- `requireLogin.js`: kiểm tra access token.
- `loadCurrentUser.js`: lấy user hiện tại từ database.
- `requireRoles.js`: kiểm tra vai trò.
- `errorHandler.js`: xử lý lỗi tập trung.
- `notFound.js`: xử lý endpoint không tồn tại.

#### `utils/`

- `token.js`: tạo và xác minh access token.
- `refreshToken.js`: tạo refresh token và hash token trước khi lưu.

## 6. Cách Frontend và Backend hoạt động cùng nhau

### Luồng đăng nhập

```text
Login.jsx
  → authApi.js
    → POST /api/auth/login
      → auth.routes.js
        → auth.controller.js
          → auth.service.js
            → user.repository.js
              → PostgreSQL
```

Backend trả về thông tin user và access token. Frontend lưu trạng thái user và access token để sử dụng cho các request tiếp theo.

### Luồng lấy danh sách sản phẩm

```text
ProductsPage.jsx
  → productApi.js
    → apiClient.js
      → GET /api/products
        → requireLogin
          → loadCurrentUser
            → product.controller.js
              → product.service.js
                → product.repository.js
                  → PostgreSQL
```

### Luồng thêm hoặc cập nhật sản phẩm

```text
ProductForm.jsx
  → ProductsPage.jsx
    → productApi.js
      → POST/PUT /api/products
        → requireLogin
          → requireRoles(["admin"])
            → Controller
              → Service validation
                → Repository
                  → PostgreSQL
```

### Luồng xác nhận phiếu nhập

```text
POST /api/goods-receipts/:id/confirm
  → requireLogin
    → requireRoles(["admin"])
      → goodsReceiptController
        → goodsReceiptService
          → goodsReceiptRepository
            → Transaction PostgreSQL
              → Cộng tồn kho
              → Ghi stock_movements
              → Đổi trạng thái phiếu thành confirmed
```

## 7. Công nghệ sử dụng

### Frontend

- React.
- React DOM.
- React Router.
- Vite.
- Material UI.
- Emotion.
- Fetch API.

### Backend

- Node.js.
- Express.
- PostgreSQL.
- `pg`.
- Argon2.
- JSON Web Token.
- Cookie Parser.
- Express Session.
- CORS.
- Dotenv.

## 8. Chạy dự án

### Backend

```bash
cd server
npm install
npm run dev
```

Hoặc:

```bash
cd server
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend thường chạy tại `http://localhost:5173`.

Backend chạy tại `http://localhost:3000`.

## 9. Kiểm tra code

Trong thư mục `client/` hoặc `server/`:

```bash
npm run lint
npm run format:check
```

Tự động format:

```bash
npm run format
```

## 10. Ghi chú cấu hình

Backend sử dụng các biến môi trường cho PostgreSQL:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Frontend hiện gọi Backend tại:

```text
http://localhost:3000
```

Tài liệu này là file mô tả tổng hợp chính của dự án. Khi cấu trúc hoặc chức năng thay đổi, cần cập nhật lại file này.
