import { Chip, IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function ProductRow({
  product,
  onEdit,
  manageProducts,
  disabled,
}) {
  const stock = Number(product.stock);
  const stockColor = stock === 0 ? "error" : stock <= 5 ? "warning" : "success";

  return (
    <TableRow hover>
      <TableCell sx={{ color: "text.secondary" }}>{product.id}</TableCell>

      <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>

      <TableCell>{product.sku}</TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>{product.supplier}</TableCell>

      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        {currencyFormatter.format(Number(product.price))}
      </TableCell>

      <TableCell align="center">
        <Chip
          label={stock === 0 ? "0 · Hết hàng" : stock}
          color={stockColor}
          size="small"
          variant="outlined"
        />
      </TableCell>

      {manageProducts && (
        <TableCell align="right">
          <Tooltip title="Sửa sản phẩm">
            <span>
              <IconButton
                color="primary"
                size="small"
                disabled={disabled}
                aria-label={`Sửa ${product.name}`}
                onClick={() => onEdit(product)}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  );
}
