// const express= require ( 'express')
// const productRouter = require('./routes/product.routes')
// const app = express()
// app.use(express.json())
// app.use('/api/products',productRouter)
const app = require("./app");
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
