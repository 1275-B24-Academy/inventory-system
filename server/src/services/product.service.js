class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getProducts() {
    return this.productRepository.findAll();
  }
  async createProduct(product) {
    if (
      product === null ||
      typeof product !== "object" ||
      Array.isArray(product)
    ) {
      const error = new Error("Dữ liệu sản phẩm không hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    const { name, sku, category, supplier, price } = product;

    const textFields = [name, sku, category, supplier];

    if (
      textFields.some(
        (value) => typeof value !== "string" || value.trim() === "",
      )
    ) {
      const error = new Error("Vui lòng nhập đầy đủ thông tin hợp lệ");
      error.statusCode = 400;
      throw error;
    }

    if (
      (typeof price !== "number" && typeof price !== "string") ||
      String(price).trim() === ""
    ) {
      const error = new Error("Giá phải là số không âm");
      error.statusCode = 400;
      throw error;
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      const error = new Error("Giá phải là số không âm");
      error.statusCode = 400;
      throw error;
    }

    return this.productRepository.create({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      supplier: supplier.trim(),
      price: productPrice,
    });
  }
  async updateProduct(id, product) {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error(" ID sản phẩm không hợp lệ ");
      error.statusCode = 400;
      throw error;
    }
    const { name, sku, category, supplier, price } = product;
    if (!name || !sku || !category || !supplier) {
      const error = new Error("Vui lòng nhập đầy đủ thông tin");
      error.statusCode = 400;
      throw error;
    }

    const productPrice = Number(price);

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
    const updatedProduct = await this.productRepository.update(productId, {
      name,
      sku,
      category,
      supplier,
      price: productPrice,
    });
    if (!updatedProduct) {
      const error = new Error("Sản phẩm không tồn tại");
      error.statusCode = 404;
      throw error;
    }
    return updatedProduct;
  }
}

module.exports = ProductService;
