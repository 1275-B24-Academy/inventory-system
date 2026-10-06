import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {useState} from 'react';
function ProductForm({onSubmit, onClose,initialData}) {
    const handleInputChange = (event) => {
       const {name, value} = event.target;
       setFormData((previous)=>({
            ...previous,
            [name]: value
       }));
    }
     const [formData, setFormData] = useState({
        name: initialData?.name ?? '',
        sku: initialData?.sku ?? '',
        category: initialData?.category ?? '',
        supplier: initialData?.supplier ?? '',
        price: initialData?.price ?? '',
        stock: initialData?.stock ?? ''
    })
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(formData);
    }
   
   const fields = [
    {name: 'name', label:'Tên sản phẩm'},
    {name: 'sku', label:'SKU'},
    {name: 'category', label:'Danh mục'},
    {name: 'supplier', label:'Nhà cung cấp'},
    {name: 'price', label:'Giá'},
    {name: 'stock', label:'Số lượng'}
   ]
    return (
       <form onSubmit={handleSubmit}>
        <h2>Thêm sản phẩm</h2>
        {fields.map((field)=>(
            <TextField 
            onChange={handleInputChange}
            key={field.name} 
            name={field.name} 
            label={field.label} 
            value={formData[field.name]}
            variant="outlined" 
            fullWidth 
            margin="normal" />
        ))}
            <Button type = "submit" variant="contained" >
                Save
            </Button>
            <Button type = "button" variant="outlined" onClick={onClose} >
                Close
            </Button>
         </form>
    );
}
export default ProductForm;