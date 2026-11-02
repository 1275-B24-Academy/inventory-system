# Inventory Management Template

Template học theo hướng **Thuật toán → Project thực tế → Computer Science**.

Trọng tâm: tổ chức file, chia layer, dependency injection đơn giản, business logic và phân quyền ở các bước sau. CRUD chỉ là template.

## Frontend

```text
client/src/
├── components/products/
│   ├── ProductCard.jsx
│   └── ProductList.jsx
├── pages/ProductsPage.jsx
├── services/productApi.js
├── App.jsx
├── main.jsx
└── index.css
```

## Backend

```text
server/src/
├── routes/product.routes.js
├── controllers/product.controller.js
├── services/product.service.js
├── repositories/
│   ├── product.repository.js
│   └── inMemoryProduct.repository.js
├── data/products.js
├── middlewares/
├── container.js
├── app.js
└── server.js
```

Luồng: Request → Route → Controller → Service → Repository → Data/DB.

## SOLID

- S: mỗi layer/file có một nhiệm vụ chính.
- O: thay repository RAM bằng PostgreSQL mà Service ít phải sửa.
- L: repository khác có thể thay InMemory repository nếu cùng contract.
- I: repository chỉ có các hàm Product cần.
- D: Service nhận repository từ bên ngoài qua dependency injection.

## Chạy

Backend:

```bash
cd server
npm install
npm run dev
```

Mở `http://localhost:3000/api/products` → ban đầu trả `[]`.

Frontend:

```bash
cd client
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Lint & Format
- **ESLint** bắt lỗi logic (biến không dùng, sai quy tắc React hooks...). Config: `client/eslint.config.js`, `server/eslint.config.js`.
- **Prettier** lo định dạng (quote, indent, xuống dòng). Config chung: `.prettierrc.json` ở thư mục gốc.

Chạy trong `client/` hoặc `server/`:
```bash
npm run lint          # kiểm tra lỗi
npm run format        # tự format toàn bộ
npm run format:check  # chỉ kiểm tra, không sửa (dùng cho CI)
```

VS Code: cài các extension được gợi ý (ESLint, Prettier, EditorConfig). Khi lưu file, code sẽ tự được format và tự sửa các lỗi lint sửa được.

## Day 2

Chỉ tập trung: ProductCard, Props, ProductList, GET/POST `/api/products`, Router.
`productApi.js` để dành khi học fetch/Axios.

## Lint & Format

The project uses ESLint to check code quality and Prettier to maintain consistent code formatting.

### Client

```bash
cd client
npm ci
npm run lint
npm run format:check
```

### Server

```bash
cd server
npm ci
npm run lint
npm run format:check
```

### VS Code Extensions

The project recommends these extensions:

- ESLint
- Prettier - Code formatter
- EditorConfig for VS Code

Formatting uses LF line endings and two-space indentation.
