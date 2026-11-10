import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const fields = [
  { name: "name", label: "Tên sản phẩm" },
  { name: "sku", label: "SKU" },
  { name: "category", label: "Danh mục" },
  { name: "supplier", label: "Nhà cung cấp" },
  { name: "price", label: "Giá bán", type: "number" },
  { name: "stock", label: "Số lượng", type: "number" },
];

export default function ProductForm({
  onSubmit,
  onClose,
  initialData,
  isSaving,
  error,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    sku: initialData?.sku ?? "",
    category: initialData?.category ?? "",
    supplier: initialData?.supplier ?? "",
    price: initialData?.price ?? "",
    stock: initialData?.stock ?? "",
  });

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isSaving) return;
    onSubmit(formData);
  }

  return (
    <Dialog
      open
      onClose={() => {
        if (!isSaving) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="product-form-title"
    >
      <DialogTitle id="product-form-title">
        {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          id="product-form"
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "grid", gap: 2.5, pt: 1 }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            {fields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type || "text"}
                value={formData[field.name]}
                onChange={handleInputChange}
                disabled={isSaving}
                required
                fullWidth
                slotProps={{
                  htmlInput:
                    field.type === "number"
                      ? { min: 0, step: field.name === "stock" ? 1 : "any" }
                      : {},
                }}
                sx={field.name === "name" ? { gridColumn: "1 / -1" } : {}}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          color="inherit"
        >
          Hủy
        </Button>

        <Button
          type="submit"
          form="product-form"
          variant="contained"
          disabled={isSaving}
        >
          {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
