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
  TextField,
  MenuItem,
  Paper,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  AddOutlined,
  Inventory2Outlined,
  WarningAmberOutlined,
  HighlightOffOutlined,
  SearchRounded,
  FilterAltOutlined,
} from "@mui/icons-material";

import MainLayout from "../components/MainLayout";
import StatCard from "../components/products/StatCard";

export default function ProductsPage() {
  //thông báo

  const LOW_STOCK_THRESHOLD = 5;

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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const query = search.trim().toLowerCase();

  const hasActiveFilters =
    query !== "" || category !== "" || stockFilter !== "";

  const filteredProducts = products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(query);
    const matchesSku = product.sku.toLowerCase().includes(query);

    const matchesSearch = matchesName || matchesSku;
    const matchesCategory = category === "" || product.category === category;

    const stock = Number(product.stock);

    let matchesStock = true;

    if (stockFilter === "out") {
      matchesStock = stock === 0;
    } else if (stockFilter === "low") {
      matchesStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].sort();

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
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
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
      filter: "low",
      value: products.filter(
        (product) =>
          Number(product.stock) > 0 &&
          Number(product.stock) <= LOW_STOCK_THRESHOLD,
      ).length,
      icon: <WarningAmberOutlined />,
      color: "#D97706",
      background: "#FFFBEB",
    },
    {
      title: "Hết hàng",
      filter: "out",
      value: products.filter((product) => Number(product.stock) === 0).length,
      icon: <HighlightOffOutlined />,
      color: "#DC2626",
      background: "#FEF2F2",
    },
  ];

  function handleToggleStockFilter(value) {
    setStockFilter((previous) => (previous === value ? "" : value));
  }
  function handleClearFilters() {
    setSearch("");
    setCategory("");
    setStockFilter("");
  }
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
            <StatCard
              key={stat.title}
              stat={stat}
              onClick={
                stat.filter
                  ? () => handleToggleStockFilter(stat.filter)
                  : undefined
              }
              selected={Boolean(stat.filter) && stockFilter === stat.filter}
            />
          ))}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            minWidth: 0,
            borderRadius: "8px",
            borderColor: "#E2E8F0",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterAltOutlined sx={{ color: "primary.main", fontSize: 22 }} />

              <Typography sx={{ fontWeight: 600 }}>Bộ lọc sản phẩm</Typography>
            </Box>

            <Button
              type="button"
              size="small"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              sx={{ textTransform: "none" }}
            >
              Xóa bộ lọc
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 2fr) minmax(0, 1fr)",
              },
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="label"
                htmlFor="product-search"
                variant="body2"
                sx={{
                  display: "block",
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Tìm kiếm
              </Typography>

              <TextField
                id="product-search"
                fullWidth
                size="small"
                placeholder="Tìm tên sản phẩm hoặc SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded
                          sx={{ fontSize: 20, color: "text.secondary" }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                id="product-category-label"
                variant="body2"
                sx={{
                  display: "block",
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                Danh mục
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    inputProps: {
                      "aria-labelledby": "product-category-label",
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              >
                <MenuItem value="">Tất cả danh mục</MenuItem>

                {categories.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mt: 2,
            }}
          >
            {query && (
              <Chip
                size="small"
                label={`Tìm kiếm: ${search.trim()}`}
                onDelete={() => setSearch("")}
                sx={{
                  maxWidth: "100%",
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                }}
              />
            )}

            {category && (
              <Chip
                size="small"
                label={`Danh mục: ${category}`}
                onDelete={() => setCategory("")}
                sx={{
                  maxWidth: "100%",
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                }}
              />
            )}

            {stockFilter && (
              <Chip
                size="small"
                label={
                  stockFilter === "low"
                    ? "Tồn kho: Sắp hết hàng"
                    : "Tồn kho: Hết hàng"
                }
                onDelete={() => setStockFilter("")}
                sx={{
                  maxWidth: "100%",
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                }}
              />
            )}

            {products.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                aria-live="polite"
              >
                Hiển thị {filteredProducts.length} / {products.length} sản phẩm
              </Typography>
            )}
          </Box>
        </Paper>
        <ProductTable
          products={filteredProducts}
          onClearFilters={handleClearFilters}
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
