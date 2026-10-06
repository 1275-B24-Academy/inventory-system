# Mô tả dự án Inventory Management

## 1. Cây thư mục

### Frontend

```text
client/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── app/
    │   └── theme.js
    ├── components/
    │   └── products/
    │       ├── ProductForm.jsx
    │       ├── ProductRow.jsx
    │       ├── ProductTable.jsx
    │       ├── StatCard.jsx
    │       └── StatCard.css
    ├── pages/
    │   └── ProductsPage.jsx
    └── services/
        └── productApi.js
```

### Backend

```text
server/
├── package.json
├── package-lock.json
└── src/
    ├── app.js
    ├── server.js
    ├── container.js
    ├── controllers/
    │   └── product.controller.js
    ├── data/
    │   └── products.js
    ├── middlewares/
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── repositories/
    │   ├── product.repository.js
    │   └── inMemoryProduct.repository.js
    ├── routes/
    │   └── product.routes.js
    └── services/
        └── product.service.js
```

`node_modules` được bỏ qua.

## 2. Công nghệ và thư viện chính

### Frontend

- React `19.1.1`
- React DOM
- Vite `7.1.7`
- Material UI `@mui/material`
- Material UI Icons
- Emotion React và Emotion Styled
- JavaScript JSX
- Fetch API của trình duyệt để gọi backend

Thông tin dependency nằm trong `client/package.json`. React được khởi tạo tại `client/src/main.jsx`, còn Vite được cấu hình tại `client/vite.config.js`.

### Backend

- Node.js
- Express `5.1.0`
- CORS `2.8.5`
- CommonJS với `require` và `module.exports`

Backend khởi tạo Express tại `server/src/app.js` và mở server tại `server/src/server.js`.

## 3. Luồng GET và POST `/api/products`

### Luồng GET `/api/products`

1. `client/src/main.jsx` gọi `createRoot()` để render component `App`.
2. `client/src/App.jsx` render component `ProductsPage`.
3. Trong `client/src/pages/ProductsPage.jsx`, `useEffect()` gọi hàm `getProducts()`.
4. Hàm `getProducts()` trong `client/src/services/productApi.js` gửi request:

   ```text
   GET http://localhost:3000/api/products/
   ```

5. `server/src/server.js` khởi động Express tại port `3000`.
6. `server/src/app.js` đăng ký router với prefix `/api/products`.
7. Handler `router.get("/")` trong `server/src/routes/product.routes.js` trả về mảng `products` bằng `res.json(products)`.
8. FE nhận dữ liệu và gọi `setProducts(data)` trong `ProductsPage`.
9. `client/src/components/products/ProductTable.jsx` lặp qua danh sách sản phẩm và render từng sản phẩm bằng `ProductRow`.

### Luồng POST `/api/products`

1. Người dùng nhập dữ liệu trong `ProductForm` tại `client/src/components/products/ProductForm.jsx`.
2. Khi submit, hàm `handleSubmit()` gọi callback `onSubmit(formData)`.
3. Callback này là `handleAddProduct()` trong `client/src/pages/ProductsPage.jsx`.
4. `handleAddProduct()` chuyển `price` sang số thực bằng `parseFloat()` và `stock` sang số nguyên bằng `parseInt()`.
5. Hàm `createProduct()` trong `client/src/services/productApi.js` gửi request:

   ```text
   POST http://localhost:3000/api/products/
   ```

   Request có header `Content-Type: application/json` và body JSON của sản phẩm.

6. Handler `router.post("/")` trong `server/src/routes/product.routes.js` thực hiện:
   - Kiểm tra `name`, `sku`, `category`, `supplier`.
   - Kiểm tra `price` không âm.
   - Kiểm tra `stock` không âm.
   - Kiểm tra SKU chưa tồn tại.
   - Tạo sản phẩm mới.
   - Thêm sản phẩm vào mảng `products`.
   - Trả về HTTP `201` cùng sản phẩm mới.

7. FE nhận kết quả trong `handleAddProduct()` và thêm sản phẩm vào state bằng `setProducts()`.

`ProductController`, `ProductService` và `container.js` có tồn tại nhưng không được sử dụng trong luồng thực tế hiện tại. `server/src/app.js` import trực tiếp router từ `server/src/routes/product.routes.js`.

## 4. Backend lưu sản phẩm ở đâu?

Sản phẩm hiện được lưu trong một mảng nằm trong bộ nhớ RAM:

- Mảng được khai báo tại `server/src/data/products.js`.
- Route GET và POST trong `server/src/routes/product.routes.js` import trực tiếp mảng này.
- Khi POST, sản phẩm được thêm bằng `products.push(newProduct)`.

Hiện tại backend không lưu vào file và không sử dụng database.

Dữ liệu tạo thêm sẽ mất khi khởi động lại server, vì khi Node.js chạy lại, module `server/src/data/products.js` được nạp lại với dữ liệu ban đầu.

README có ghi endpoint ban đầu trả về `[]`, nhưng code thực tế hiện có sẵn 3 sản phẩm trong `server/src/data/products.js`.

## 5. Cấu trúc sản phẩm và cách tạo ID

Mỗi sản phẩm thực tế có các trường:

```js
{
  id,
  name,
  sku,
  category,
  supplier,
  price,
  stock
}
```

Dữ liệu mẫu nằm trong `server/src/data/products.js`. Việc hiển thị các trường này được thực hiện tại `client/src/components/products/ProductRow.jsx`.

ID được tạo trong handler POST tại `server/src/routes/product.routes.js`:

```js
id: products.length + 1
```

ID dựa trên số lượng phần tử hiện có trong mảng, không phải ID từ database.

Repository in-memory cũng có cách tạo ID tương tự trong `server/src/repositories/inMemoryProduct.repository.js`, nhưng repository này không thuộc luồng đang chạy.

## 6. Database, biến môi trường và migration/schema

### Database

Chưa tìm thấy cấu hình kết nối hoặc thư viện database. `server/package.json` chỉ có `express` và `cors`.

Chưa tìm thấy PostgreSQL, MySQL, MongoDB, SQLite, Prisma, Sequelize, TypeORM hoặc thư viện database tương tự.

### Biến môi trường

Chưa tìm thấy file `.env` hoặc code sử dụng `process.env`.

File `.gitignore` có khai báo bỏ qua `.env`, nhưng hiện không tìm thấy file `.env` trong cấu trúc dự án.

Port backend và địa chỉ CORS đang được viết trực tiếp trong code:

- Port `3000`: `server/src/server.js`
- Origin `http://localhost:5173`: `server/src/app.js`
- API URL `http://localhost:3000/api/products/`: `client/src/services/productApi.js`

### Migration và schema

Chưa tìm thấy file migration, schema database hoặc cấu hình ORM.

## 7. Lệnh chạy FE và BE

### Backend

```bash
cd server
npm install
npm run dev
```

Script `dev` chạy `node --watch src/server.js`.

Có thể chạy dạng thông thường:

```bash
cd server
npm start
```

Script `start` chạy `node src/server.js`.

Các lệnh được khai báo trong `server/package.json`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend chạy bằng Vite, thường tại:

```text
http://localhost:5173
```

Các script FE nằm trong `client/package.json`.
