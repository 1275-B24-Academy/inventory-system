class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getProducts() {
    return this.productRepository.findAll();
  }
  // product đã được validate (đã trim, price đã là number) bởi createProductBody ở route.
  async createProduct({ name, sku, category, supplier, price }) {
    return this.productRepository.create({
      name,
      sku,
      category,
      supplier,
      price,
    });
  }
  // id và product đã được validate bởi productIdParams / updateProductBody ở route.
  async updateProduct(id, { name, sku, category, supplier, price }) {
    const updatedProduct = await this.productRepository.update(id, {
      name,
      sku,
      category,
      supplier,
      price,
    });
    if (!updatedProduct) {
      const error = new Error("Sản phẩm không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    return updatedProduct;
  }
}
export default ProductService;
