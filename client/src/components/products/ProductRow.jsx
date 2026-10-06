import Button from "@mui/material/Button"



function ProductRow({ product, onEdit }) {
    const handleEditClick = () => {
        onEdit(product);
    }
    return (
        <tr>
            <td>{product.id}</td>
            <td>{product.name}</td>
            <td>{product.sku}</td>
            <td>{product.category}</td>
            <td>{product.supplier}</td> 
            <td>{product.price}</td>
            <td>{product.stock}</td>
            <td>    
                <Button variant="outlined" 
                        size="small"
                        onClick = {handleEditClick}>

                      Sửa  
                </Button>
            </td>
        </tr>
    )
}
export default ProductRow