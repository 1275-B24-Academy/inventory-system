import { useState, useEffect } from "react";

import { useAuth } from "../auth/useAuth";
import ProductTable from "../components/products/ProductTable";
import ProductForm from "../components/products/ProductForm";
import {
  getProducts,
  createProduct,
  updateProduct,
} from "../services/productApi";

export default function ProductsPage() {
  const { user, logout, apiRequest } = useAuth();

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
          productData
        );

        setProducts((previous) =>
          previous.map((product) =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );
      } else {
        const createdProduct = await createProduct(
          apiRequest,
          productData
        );

        setProducts((previous) => [
          ...previous,
          createdProduct,
        ]);
      }

      setShowForm(false);
      setEditingProduct(null);
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

  async function handleLogout() {
    setError("");

    try {
      await logout();
    } catch (error) {
      setError(error.message || "Đăng xuất thất bại.");
    }
  }

  return (
    <div>
      <header>
        <h1>Quản lý sản phẩm</h1>

        <div>
          <span>Xin chào, {user?.name || "bạn"}</span>
          <button
            onClick={handleLogout}
            disabled={isSaving}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {isSaving && <p>Đang lưu sản phẩm...</p>}

      <ProductTable
        products={products}
        onEdit={handleEditProduct}
      />

      <button
        disabled={isSaving}
        onClick={() => {
          setError("");
          setEditingProduct(null);
          setShowForm(true);
        }}
      >
        Thêm sản phẩm
      </button>

      {showForm && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          initialData={editingProduct}
          onSubmit={handleSaveProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}