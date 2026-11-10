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

## Cách chạy

Cần cài trước: [Node.js 22](https://nodejs.org/) và [PostgreSQL](https://www.postgresql.org/download/) (bản 14 trở lên).

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

**4. Dùng thử:** mở <http://localhost:5173>, bấm đăng ký tài khoản rồi đăng nhập. Tài khoản mới có quyền `staff`; muốn có quyền `admin` thì chạy:

```bash
psql -d inventory -c "UPDATE users SET role = 'admin' WHERE email = 'email-cua-ban@example.com';"
```

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
