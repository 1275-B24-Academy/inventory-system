# Quy ước đóng góp

## Ngôn ngữ

| Nơi                                                     | Ngôn ngữ       |
| ------------------------------------------------------- | -------------- |
| Code: tên biến, hàm, file, route, bảng/cột DB           | English        |
| Commit message                                          | English cơ bản |
| PR title                                                | English cơ bản |
| Comment trong code, PR description, issue, docs, README | Tiếng Việt     |

**Thuật ngữ chuyên ngành giữ nguyên tiếng Anh, không dịch.** Ví dụ: health check, liveness, connection pool, migration, middleware, rate limit, refresh token, branch, merge, deploy.

```js
// ✅ Liveness: chỉ báo process còn sống, không query DB.
// ❌ Kiểm tra sức khỏe: chỉ báo tiến trình còn sống, không truy vấn cơ sở dữ liệu.
```

## Commit message & PR title

Theo [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <mô tả>`

- `type`: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`, `style`
- `scope` (không bắt buộc): `server`, `client`, `db`…
- Mô tả: English cơ bản, viết thường, dạng mệnh lệnh (`add`, không phải `added`), không dấu chấm cuối

```text
feat(server): add GET /health endpoint
fix(client): keep user logged in after page refresh
docs: add language convention
```

PR title phải theo đúng format này: repo dùng **squash merge**, PR title sẽ thành commit message trên `main`.
