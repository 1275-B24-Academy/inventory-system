const API_URL = `${import.meta.env.VITE_API_URL ?? ""}/api/products`;

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
