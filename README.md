# Inventory Management

Ứng dụng web quản lý kho cho doanh nghiệp nhỏ: đăng ký/đăng nhập, phân quyền admin/staff, quản lý sản phẩm và phiếu nhập kho.

Stack: **React + Vite + Material UI** (client), **Node.js + Express** (server), **PostgreSQL**, xác thực bằng **JWT** (access token + refresh token).

## Ảnh chụp màn hình

| Đăng nhập                                      | Sản phẩm                                         |
| ---------------------------------------------- | ------------------------------------------------ |
| ![Trang đăng nhập](docs/screenshots/login.png) | ![Trang sản phẩm](docs/screenshots/products.png) |

## Cách chạy

Cần cài trước: [Node.js 22](https://nodejs.org/) và [PostgreSQL](https://www.postgresql.org/download/) (bản 14 trở lên).

**1. Tạo database** (chạy ở thư mục gốc của repo):

```bash
createdb inventory
psql -d inventory -f server/db/schema.sql
```

> Trên Windows, nếu không có lệnh `createdb`/`psql`, mở **SQL Shell (psql)** đi kèm bộ cài, tạo DB bằng `CREATE DATABASE inventory;` rồi `\c inventory` và `\i server/db/schema.sql` (đường dẫn đầy đủ tới file).

**2. Chạy server** (cổng 3000):

```bash
cd server
cp .env.example .env   # sửa DB_USER, DB_PASSWORD cho khớp Postgres trên máy
npm install
npm run dev
```

**3. Chạy client** (mở terminal khác, cổng 5173):

```bash
cd client
npm install
npm run dev
```

Client không cần tạo `.env`: địa chỉ server khi dev đã có sẵn trong `client/.env.development`.

**4. Dùng thử:** mở <http://localhost:5173>, bấm đăng ký tài khoản rồi đăng nhập. Tài khoản mới có quyền `staff`; muốn có quyền `admin` thì chạy:

```bash
psql -d inventory -c "UPDATE users SET role = 'admin' WHERE email = 'email-cua-ban@example.com';"
```

## Tài liệu

Kiến trúc, cấu trúc thư mục, luồng đăng nhập/sản phẩm/phiếu nhập và quy ước lint/format: xem [PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md).
