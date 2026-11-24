# Inventory Management

Ứng dụng web quản lý kho cho doanh nghiệp nhỏ: đăng ký/đăng nhập, phân quyền admin/staff, quản lý sản phẩm, phiếu nhập và phiếu xuất kho.

Stack: **React + Vite + Material UI** (client), **Node.js + Express** (server), **PostgreSQL**, xác thực bằng **JWT** (access token + refresh token).

## Tổng quan

- **Client** là ứng dụng React một trang: hiển thị giao diện, giữ trạng thái đăng nhập và gọi API của server.
- **Server** là REST API viết bằng Express, chia lớp theo luồng **Route → Middleware → Controller → Service → Repository → PostgreSQL**: middleware kiểm tra đăng nhập/quyền, service chứa nghiệp vụ, repository là nơi duy nhất truy cập database (qua Prisma Client).
- **Database** PostgreSQL lưu người dùng, sản phẩm, phiếu nhập/xuất và lịch sử tồn kho; cấu trúc bảng mô tả trong `server/prisma/schema.prisma`, mọi thay đổi bảng đi qua **migration** trong `server/prisma/migrations/` (dùng [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)).
- **Xác thực**: đăng nhập nhận access token (gửi kèm mỗi request) và refresh token (cookie) để tự gia hạn phiên.

## Ảnh chụp màn hình

| Đăng nhập                                      | Sản phẩm                                         |
| ---------------------------------------------- | ------------------------------------------------ |
| ![Trang đăng nhập](docs/screenshots/login.png) | ![Trang sản phẩm](docs/screenshots/products.png) |

## Chạy nhanh bằng Docker

Chỉ cần cài Docker: [Docker Desktop](https://www.docker.com/products/docker-desktop/), hoặc trên Mac có thể dùng [Colima](https://github.com/abiosoft/colima) / [OrbStack](https://orbstack.dev/) (lệnh `docker` giống hệt). Không cần cài Node.js hay PostgreSQL.

```bash
docker compose up --build
```

Mở <http://localhost:3000>, đăng nhập bằng tài khoản seed:

| Email               | Mật khẩu   | Quyền   |
| ------------------- | ---------- | ------- |
| `admin@example.com` | `admin123` | `admin` |
| `staff@example.com` | `staff123` | `staff` |

Chuyện gì xảy ra khi chạy lệnh trên:

- `docker compose` đọc `docker-compose.yml`, dựng 2 service: `db` (Postgres 16) và `app` (build từ `Dockerfile`: Express vừa chạy API vừa serve bản build của client, giống production, nên chỉ có một cổng 3000).
- `app` chờ `db` healthy, rồi `docker-entrypoint.sh` chạy migration → seed tài khoản mẫu → start server.
- Dữ liệu Postgres nằm trong volume `pgdata`, **tách riêng** với Postgres trên máy bạn. Seed chạy mỗi lần start nhưng không tạo trùng.

Lệnh hay dùng:

```bash
docker compose up -d --build   # chạy nền
docker compose logs -f app     # xem log server (Ctrl+C chỉ thoát xem log, container vẫn chạy)
docker compose down            # dừng, giữ dữ liệu
docker compose down -v         # dừng và xóa luôn dữ liệu (volume pgdata)
docker compose up -d db        # chỉ chạy Postgres, server/client chạy bằng npm như bên dưới
```

> Cổng 3000 hoặc 5432 bị chiếm (đang chạy `npm run dev` hoặc Postgres trên máy)? Đổi cổng phía máy: `APP_PORT=3001 POSTGRES_PORT=5433 docker compose up`.

Docker phù hợp để dùng thử. Khi sửa code, chạy bằng Node (bên dưới) để có hot reload.

## Cách chạy (dev)

Cần cài trước: [Node.js 22](https://nodejs.org/) và [PostgreSQL](https://www.postgresql.org/download/) (bản 14 trở lên). Không muốn cài PostgreSQL thì dùng `docker compose up -d db` (DB đã có sẵn tên `inventory`, `DATABASE_URL` mặc định trong `.env.example` khớp luôn), bỏ qua bước 1.

**1. Tạo database trống:**

```bash
createdb inventory
```

> Trên Windows, nếu không có lệnh `createdb`, mở **SQL Shell (psql)** đi kèm bộ cài rồi chạy `CREATE DATABASE inventory;`.

**2. Tạo bảng và chạy server** (cổng 3000):

```bash
cd server
cp .env.example .env   # sửa DATABASE_URL cho khớp Postgres trên máy
npm install            # tự chạy `prisma generate` để sinh Prisma Client
npm run db:migrate     # áp các migration -> tạo đủ bảng
npm run db:seed        # tạo tài khoản admin/staff mẫu (xem bảng ở mục Docker)
npm run dev
```

> DB của bạn đã có bảng từ trước (tạo bằng file `schema.sql` cũ)? Chạy **một lần** `npx prisma migrate resolve --applied 0_init` trong `server/` để Prisma ghi nhận migration đầu tiên đã áp, sau đó dùng `npm run db:migrate` như bình thường.

**3. Chạy client** (mở terminal khác, cổng 5173):

```bash
cd client
npm install
npm run dev
```

Client không cần tạo `.env`: địa chỉ server khi dev đã có sẵn trong `client/.env.development`.

**4. Dùng thử:** mở <http://localhost:5173>, đăng nhập bằng tài khoản seed (`admin@example.com` / `admin123`), hoặc bấm đăng ký tài khoản mới. Tài khoản mới có quyền `staff`; muốn có quyền `admin` thì chạy:

```bash
psql -d inventory -c "UPDATE users SET role = 'admin' WHERE email = 'email-cua-ban@example.com';"
```

## Test (server)

Dùng [Vitest](https://vitest.dev/) + [Supertest](https://github.com/forwardemail/supertest). Code test nằm trong `server/tests/`:

| Loại                 | Thư mục              | Đặc điểm                                                                                  |
| -------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| **Unit test**        | `tests/unit/`        | Test từng service/util, repository được mock. Không cần DB, chạy rất nhanh.               |
| **Integration test** | `tests/integration/` | Gọi API qua HTTP (Supertest), đi qua toàn bộ route -> service -> Prisma -> Postgres thật. |

**Database test:** test dùng một database riêng, `inventory_test` (không dùng chung với DB dev, vì test sẽ xóa sạch dữ liệu). Bạn không cần tạo tay: lần chạy đầu tiên test tự tạo DB nếu chưa có (user cần quyền `CREATEDB`, user mặc định của Postgres local đã có).

Mặc định test kết nối `postgresql://postgres:postgres@localhost:5432/inventory_test`. Postgres trên máy bạn dùng user/password khác thì thêm `TEST_DATABASE_URL=...` vào `server/.env` (xem `.env.example`). Tên DB phải kết thúc bằng `_test`, nếu không test từ chối chạy.

Các lệnh chạy trong thư mục `server/`:

```bash
npm test                  # chạy cả unit lẫn integration (tự áp migration lên DB test)
npm run test:unit         # chỉ unit test, không cần DB
npm run test:integration  # chỉ integration test
npm run test:watch        # unit test ở chế độ watch, tự chạy lại khi sửa code
npm run test:coverage     # kèm báo cáo coverage (thư mục coverage/)
```

Viết test mới: sao chép test mẫu cùng loại (`tests/unit/product.service.test.js`, `tests/integration/product.test.js`). Integration test có sẵn helper trong `tests/integration/helpers.js`: `resetDb()` (gọi trong `beforeEach`), `createUser()`, `loginAs()`, `createProduct()`.

CI chạy `npm test` trên mỗi PR, với Postgres chạy bằng GitHub Actions service.

## Thay đổi database (migration)

Không sửa bảng trực tiếp trên database. Mọi thay đổi đi qua **migration**: file SQL có version, commit cùng code, ai pull về cũng áp được đúng thứ tự.

Các lệnh chạy trong thư mục `server/`:

1. Sửa model trong `prisma/schema.prisma`.
2. Tạo migration và áp vào DB local:

   ```bash
   npm run db:migrate:dev -- --name add_xxx   # add_xxx: mô tả ngắn, ví dụ add_product_unit
   npx prisma generate                        # sinh lại Prisma Client theo schema mới
   ```

   Prisma so sánh `schema.prisma` với database rồi sinh file `prisma/migrations/<thời gian>_add_xxx/migration.sql`.

3. Mở `migration.sql` đọc lại, rồi commit cả `schema.prisma` lẫn thư mục migration mới.
4. Người khác pull về chỉ cần chạy `npm run db:migrate`. Trên production, Render tự chạy lệnh này mỗi lần deploy.

> **CHECK constraint** (ví dụ `stock >= 0`) không viết được trong `schema.prisma`. Tạo migration rỗng bằng `npm run db:migrate:dev -- --name add_xxx --create-only`, tự viết SQL vào `migration.sql`, rồi chạy `npm run db:migrate:dev` để áp.
>
> Không sửa file `migration.sql` đã merge vào `main`: database ở nơi khác đã áp nó rồi. Muốn đổi tiếp thì tạo migration mới.
