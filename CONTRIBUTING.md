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

## Viết issue

Issue chia 3 loại, mỗi loại một vai trò. Viết bằng tiếng Việt, xưng "bạn", ví dụ đời thường; thuật ngữ lần đầu xuất hiện thì giải thích ngắn hoặc link tới glossary (#71).

| Loại                   | Dùng để                   | Có gì                                                                                          |
| ---------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| Epic                   | Gom các task cùng chủ đề  | Bối cảnh, bảng thuật ngữ ngắn, kết quả khi xong, thứ tự làm, link docs                         |
| Task                   | Một việc TTS bắt tay làm  | Mục tiêu, các bước có file thật, acceptance criteria, tự kiểm tra, ngoài phạm vi               |
| Docs (issue type Docs) | Giải thích sâu một chủ đề | Ví dụ, sơ đồ, câu hỏi tự kiểm tra kèm đáp án; mỗi issue ~2–3.5k ký tự, dài thì tách "Phần x/n" |

Mô tả dài thì tách ra Docs, task chỉ giữ 1 câu và link.

### Dòng đầu của epic và task

Tách thành 3 gạch đầu dòng trong blockquote, nhóm nào không có thì bỏ:

```md
> - **Cấu trúc:** Epic #38 · Tiếp nối #48 (auth + product đã xong ở #121)
> - **Đọc trước (kỹ thuật):** #119 validation và Zod
> - **Đọc trước (thiết kế hệ thống):** #120 validation nên đặt ở tầng nào
```

| Nhóm                              | Nội dung                                                            |
| --------------------------------- | ------------------------------------------------------------------- |
| **Cấu trúc**                      | Quan hệ trong backlog: epic cha, ticket làm trước/sau, PR liên quan |
| **Đọc trước (kỹ thuật)**          | Khái niệm hoặc công cụ cần hiểu để viết code (Zod, Prisma…)         |
| **Đọc trước (thiết kế hệ thống)** | Quyết định kiến trúc: logic đặt ở tầng nào, luồng request, ADR      |

Không gộp ba nhóm vào một dòng. Issue Docs dùng header riêng: `Phần x/n · Đọc trước · Đọc tiếp`.
