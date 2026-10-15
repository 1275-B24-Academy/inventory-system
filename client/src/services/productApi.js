const API_URL = "http://localhost:3000/api/products";

export function getProducts(apiRequest) {
  return apiRequest(API_URL);
}

export function createProduct(apiRequest, product) {
  return apiRequest(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
}

export function updateProduct(apiRequest, id, product) {
  return apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
}