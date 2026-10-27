import {
  Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";

import ProductRow from "./ProductRow";

export default function ProductTable({
  products, onEdit, manageProducts, disabled,
}) {
  return (
    <Paper variant="outlined" 
      sx={{ 
        borderRadius: "8px", 
        overflow: "hidden",
        borderColor: "#E2E8F0", }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6">Danh sách sản phẩm</Typography>
        <Typography variant="body2" color="text.secondary">
          {products.length} sản phẩm
        </Typography>
      </Box>

      <TableContainer 
        sx={{ maxHeight: 312, 
              overflowY: "auto",
              scrollSnapType: "y mandatory",
              scrollPaddingTop: "56px", }}>
        <Table stickyHeader sx={{ minWidth: 900 }} aria-label="Danh sách sản phẩm">
          <TableHead
            sx={{
                "& th": {
                  height: 56,
                  py: 0,
                  bgcolor: "#F8FAFC",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                },
              }}>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "#F8FAFC",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell align="right">Giá bán</TableCell>
              <TableCell align="center">Tồn kho</TableCell>
              {manageProducts && <TableCell align="right">Thao tác</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={manageProducts ? 8 : 7}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  Chưa có sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  manageProducts={manageProducts}
                  disabled={disabled}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}