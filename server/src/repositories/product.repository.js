// Các cột trả về cho API (giống câu SELECT cũ, không có created_at).
const productSelect = {
  id: true,
  name: true,
  sku: true,
  category: true,
  supplier: true,
  price: true,
  stock: true,
};

// Prisma trả cột NUMERIC dưới dạng Decimal. Driver `pg` cũ trả chuỗi (ví dụ "15000.00"),
// nên đổi về chuỗi 2 chữ số thập phân để JSON của API không đổi.
function toProductResponse(product) {
  return { ...product, price: product.price.toFixed(2) };
}

class ProductRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      select: productSelect,
      orderBy: { id: "asc" },
    });
    return products.map(toProductResponse);
  }

  async create(product) {
    const { name, sku, category, supplier, price, stock } = product;
    const created = await this.prisma.product.create({
      data: { name, sku, category, supplier, price, stock },
      select: productSelect,
    });
    return toProductResponse(created);
  }

  async update(id, product) {
    const { name, sku, category, supplier, price, stock } = product;
    try {
      const updated = await this.prisma.product.update({
        where: { id },
        data: { name, sku, category, supplier, price, stock },
        select: productSelect,
      });
      return toProductResponse(updated);
    } catch (error) {
      // P2025: không có dòng nào để update -> trả undefined, service sẽ báo 404.
      if (error.code === "P2025") {
        return undefined;
      }
      throw error;
    }
  }
}

export default ProductRepository;
