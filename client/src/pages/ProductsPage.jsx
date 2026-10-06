
import ProductTable from "../components/products/ProductTable";
import { getProducts, createProduct, updateProduct } from "../services/productApi";
import { useState, useEffect } from "react";
import ProductForm from "../components/products/ProductForm";
   


function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const handleSaveProduct = async (formData) =>{
      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
      try {
        if(editingProduct !== null){
          const updatedProduct = await updateProduct(
            editingProduct.id, 
            productData);
            setProducts((prevProducts)=>
              prevProducts.map((product)=>
                product.id === updatedProduct.id
                ? updatedProduct
                : product    
              )
            );
        }else{
            const createdProduct = await createPoduct(productData);
            setProducts((prevProducts)=>[
              ...prevProducts,
              createdProduct
              ]);
            }
            setShowForm(false);
            setEditingProduct(null);

        }catch (error) {
          alert(error.message);
        }
      };

    
    const handleEditProduct = (product) => {
      setEditingProduct(product);
      setShowForm(true);
    }
    const handleCloseForm = () => {
      setShowForm(false);
      setEditingProduct(null);
    }    
    useEffect(() => {
        getProducts().then((data)=>{
            setProducts(data)
        })
    }, []);
  return (
    <div>
      <h1>Products</h1>
      <ProductTable 
      onEdit={handleEditProduct}
      products={products} />
      <button onClick ={() =>{
        setEditingProduct(null); 
        setShowForm(true);}}>
        Add Product
      </button>
        {showForm && <ProductForm 
        key={editingProduct?.id ?? "new" }
        initialData={editingProduct}
        onSubmit={handleSaveProduct}
        onClose={handleCloseForm}
        />}
    </div>
  );
}

export default ProductsPage;    