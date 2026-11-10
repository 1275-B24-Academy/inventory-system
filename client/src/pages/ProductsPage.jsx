import { useState, useEffect } from "react";

import { useAuth } from "../auth/useAuth";
import ProductTable from "../components/products/ProductTable";
import ProductForm from "../components/products/ProductForm";
import { useNotification } from "../notifications/useNotification";
import {
  getProducts,
  createProduct,
  updateProduct,
} from "../services/productApi";
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  AddOutlined,
  Inventory2Outlined,
  WarningAmberOutlined,
  HighlightOffOutlined,
} from "@mui/icons-material";

import MainLayout from "../components/MainLayout";
import StatCard from "../components/products/StatCard";

export default function ProductsPage() {
  //thông báo
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, logout, apiRequest } = useAuth();

  const manageProducts = user?.role === "admin";

  const notify = useNotification();

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await getProducts(apiRequest);

        if (!cancelled) {
          setProducts(data);
          setError("");
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [apiRequest]);

  async function handleSaveProduct(formData) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");

    const productData = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      supplier: formData.supplier,
      price: Number(formData.price),
    };

    const editingId = editingProduct?.id ?? null;

    try {
      if (editingId !== null) {
        const updatedProduct = await updateProduct(
          apiRequest,
          editingId,
          productData,
        );

        setProducts((previous) =>
          previous.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        );
      } else {
        const createdProduct = await createProduct(apiRequest, productData);

        setProducts((previous) => [...previous, createdProduct]);
      }

      setShowForm(false);
      setEditingProduct(null);

      notify(
        editingId !== null
          ? "Cập nhật sản phẩm thành công."
          : "Thêm sản phẩm thành công.",
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleEditProduct(product) {
    if (isSaving) {
      return;
    }

    setError("");
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleCloseForm() {
    if (isSaving) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
  }

  function handleCloseLogoutConfirm() {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
  }

  async function handleLogout() {
    if (isLoggingOut) return;

    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      // AuthProvider xóa trạng thái đăng nhập.
      // AppRoutes sẽ chuyển về /login.
    } catch (error) {
      setError(error.message || "Đăng xuất thất bại.");
    } finally {
      setIsLoggingOut(false);
    }
  }
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: products.length,
      icon: <Inventory2Outlined />,
      color: "#2563EB",
      background: "#EFF6FF",
    },
    {
      title: "Sắp hết hàng",
      value: products.filter(
        (product) => Number(product.stock) > 0 && Number(product.stock) <= 5,
      ).length,
      icon: <WarningAmberOutlined />,
      color: "#D97706",
      background: "#FFFBEB",
    },
    {
      title: "Hết hàng",
      value: products.filter((product) => Number(product.stock) === 0).length,
      icon: <HighlightOffOutlined />,
      color: "#DC2626",
      background: "#FEF2F2",
    },
  ];

  return (
    <MainLayout
      user={user}
      onLogout={() => {
        setError("");
        setShowLogoutConfirm(true);
      }}
      disabled={isSaving || isLoggingOut}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}
            >
              Sản phẩm
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Quản lý danh sách và thông tin sản phẩm trong kho
            </Typography>
          </Box>

          {manageProducts && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              disabled={isSaving}
              onClick={() => {
                setError("");
                setEditingProduct(null);
                setShowForm(true);
              }}
            >
              Thêm sản phẩm
            </Button>
          )}
        </Stack>

        {error && !showForm && <Alert severity="error">{error}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </Box>

        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          manageProducts={manageProducts}
          disabled={isSaving}
        />
      </Stack>

      {manageProducts && showForm && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          initialData={editingProduct}
          onSubmit={handleSaveProduct}
          onClose={handleCloseForm}
          isSaving={isSaving}
          error={error}
        />
      )}
      <Dialog
        open={showLogoutConfirm}
        onClose={handleCloseLogoutConfirm}
        fullWidth
        maxWidth="xs"
        aria-labelledby="logout-title"
        aria-describedby="logout-description"
      >
        <DialogTitle id="logout-title">Xác nhận đăng xuất</DialogTitle>

        <DialogContent>
          <DialogContentText id="logout-description">
            Bạn có chắc muốn đăng xuất khỏi tài khoản này?
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseLogoutConfirm}
            disabled={isLoggingOut}
            color="inherit"
          >
            Hủy
          </Button>

          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="contained"
          >
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
