class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  getProducts = async (req, res, next) => {
    try {
      const products = await this.productService.getProducts();

      return res.json(products);
    } catch (error) {
      return next(error);
    }
  }

  createProduct = async (req, res, next) => {
    try {
      const createdProduct =
        await this.productService.createProduct(req.body);

      return res.status(201).json({
        ...createdProduct,
        price: Number(createdProduct.price),
      });
    } catch (error) {
      return next(error);
    }
  }
  updateProduct = async (req, res, next) => {
    try{
      const updatedProduct = await this.productService.updateProduct(
        req.params.id,
        req.body
        );
       return res.json({
        ...updatedProduct,
        price: Number(updatedProduct.price),
       });    
    }catch(error) {
      return next(error);
    }
  }
}

module.exports = ProductController;