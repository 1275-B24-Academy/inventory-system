import { useState, useRef, useCallback, useMemo } from "react";

import { AuthContext } from "./AuthContext";
import { loginApi, logoutApi, refreshApi } from "../services/authApi";
import { createApiClient } from "../services/apiClient";

function readSavedUser() {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken"),
  );

  // Giúp request luôn đọc được token mới nhất.
  const accessTokenRef = useRef(accessToken);

  // Các request cùng chờ một lần refresh.
  const refreshPromiseRef = useRef(null);

  // Phân biệt các lần đăng nhập để kết quả cũ
  // không khôi phục trạng thái sau khi đã đăng xuất.
  const sessionVersionRef = useRef(0);

  const saveAccessToken = useCallback((token) => {
    accessTokenRef.current = token;
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
  }, []);

  const clearAuth = useCallback(() => {
    sessionVersionRef.current += 1;
    accessTokenRef.current = null;

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    setUser(null);
    setAccessToken(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await loginApi(credentials);

      sessionVersionRef.current += 1;

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      saveAccessToken(data.accessToken);

      return data;
    },
    [saveAccessToken],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    clearAuth();
  }, [clearAuth]);

  const refreshAccessToken = useCallback(() => {
    if (refreshPromiseRef.current !== null) {
      return refreshPromiseRef.current;
    }

    const sessionVersion = sessionVersionRef.current;

    refreshPromiseRef.current = refreshApi()
      .then((data) => {
        if (sessionVersion !== sessionVersionRef.current) {
          throw new Error("Trạng thái đăng nhập đã thay đổi.");
        }

        if (
          typeof data.accessToken !== "string" ||
          data.accessToken.length === 0
        ) {
          throw new Error("Backend không trả access token hợp lệ.");
        }

        saveAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((error) => {
        // Refresh bị từ chối xác thực → về Login.
        // Lỗi mạng hoặc 500 chỉ chuyển lỗi lên giao diện.
        if (
          error.status === 401 &&
          sessionVersion === sessionVersionRef.current
        ) {
          clearAuth();
        }

        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [saveAccessToken, clearAuth]);

  const apiRequest = useMemo(
    () =>
      // Getter chỉ được gọi khi apiRequest thực hiện request, không phải khi render.
      // eslint-disable-next-line react-hooks/refs
      createApiClient({
        getAccessToken: () => accessTokenRef.current,
        refreshAccessToken,
      }),
    [refreshAccessToken],
  );

  const value = {
    user,
    isAuthenticated: Boolean(user && accessToken),
    login,
    logout,
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
