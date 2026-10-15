// Đọc response và giữ thông tin lỗi cho nơi gọi.
export async function readResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Không thể thực hiện yêu cầu."
    );

    error.status = response.status;
    error.code = data.code;

    throw error;
  }

  return data;
}

// Tạo hàm gửi request có xác thực.
export function createApiClient({
  getAccessToken,
  refreshAccessToken,
}) {
  return async function apiRequest(url, options = {}) {
    async function send(token) {
      const headers = new Headers(options.headers);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      return readResponse(response);
    }

    const originalToken = getAccessToken();

    try {
      return await send(originalToken);
    } catch (error) {
      const isExpired =
        error.status === 401 &&
        error.code === "ACCESS_TOKEN_EXPIRED";

      if (!isExpired) {
        throw error;
      }

      // Một request khác có thể đã refresh xong.
      const currentToken = getAccessToken();

      const newToken =
        currentToken && currentToken !== originalToken
          ? currentToken
          : await refreshAccessToken();

      // Thử lại một lần. Nếu lỗi, chuyển cho nơi gọi xử lý.
      return send(newToken);
    }
  };
}