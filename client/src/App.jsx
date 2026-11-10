import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./app/theme";
import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import Login from "./pages/Login";
import ProductsPage from "./pages/ProductsPage";
import Register from "./pages/Register";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/products" replace /> : <Register />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/products" replace /> : <Login />
        }
      />

      <Route
        path="/products"
        element={
          isAuthenticated ? <ProductsPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/products" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
