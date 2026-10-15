import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import Login from "./pages/Login";
import ProductsPage from "./pages/ProductsPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/products" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/products"
        element={
          isAuthenticated ? (
            <ProductsPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/products" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}