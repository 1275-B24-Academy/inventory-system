import ProductRow from "./ProductRow";
function ProductTable({ products, onEdit }) {
  return (
    <table>
       <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>SKU</th>
          <th>Category</th>
          <th>Supplier</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Thao tác</th>
        </tr>
       </thead>
    
    <tbody>
      {products.map((product) => (
        <ProductRow
          key = {product.id}
          product = {product}
          onEdit = {onEdit}
          />
      ))}
    </tbody>
    </table>
  )
}
export default ProductTable
