class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getProducts() {
    return this.productRepository.findAll();
  }
  async createProduct(product) {
    const { name, sku, category, supplier, price, stock } = product;

    if (!name || !sku || !category || !supplier) {
      const error = new Error("Vui lòng nhập đầy đủ thông tin");
      error.statusCode = 400;
      throw error;
    }

    const productPrice = Number(price);
    const productStock = Number(stock);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      const error = new Error("Giá phải là số không âm");
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(productStock) || productStock < 0) {
      const error = new Error("Số lượng phải là số nguyên không âm");
      error.statusCode = 400;
      throw error;
    }

    return this.productRepository.create({
      name,
      sku,
      category,
      supplier,
      price: productPrice,
      stock: productStock,
    });
  }
  async updateProduct(id, product) {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error(" ID sản phẩm không hợp lệ ");
      error.statusCode = 400;
      throw error;
    }
    const { name, sku, category, supplier, price, stock } = product;
    if (!name || !sku || !category || !supplier) {
      const error = new Error("Vui lòng nhập đầy đủ thông tin");
      error.statusCode = 400;
      throw error;
    }

    const productPrice = Number(price);
    const productStock = Number(stock);

    if (
      price === null ||
      price === undefined ||
      String(price).trim() === "" ||
      !Number.isFinite(productPrice) ||
      productPrice < 0
    ) {
      const error = new Error("Giá phải là số không âm");
      error.statusCode = 400;
      throw error;
    }

    if (
      stock === null ||
      stock === undefined ||
      String(stock).trim() === "" ||
      !Number.isInteger(productStock) ||
      productStock < 0
    ) {
      const error = new Error("Số lượng phải là số nguyên không âm");
      error.statusCode = 400;
      throw error;
    }

    const updatedProduct = await this.productRepository.update(productId, {
      name,
      sku,
      category,
      supplier,
      price: productPrice,
      stock: productStock,
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
