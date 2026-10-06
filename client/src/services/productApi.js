
const API_URL = 'http://localhost:3000/api/products/';
export const getProducts = async () => {
  const res = await fetch(API_URL);
  const data = await res.json();
  if(!res.ok){
    throw new Error(data.message || "không thể lấy danh sách sản phẩm.")
  }
  return data;
}
export const createProduct = async (product) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if(!res.ok){
    throw new Error(data.message || "không thể tạo sản phẩm.")
  }
  return data;
}
export const updateProduct = async (id, product) => {
  const res = await fetch(`${API_URL}${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if(!res.ok){
    throw new Error(data.message || "không thể cập nhật sản phẩm.")
  }
  return data;
}