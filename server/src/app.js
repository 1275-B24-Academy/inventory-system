const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);


app.use(errorHandler);

module.exports = app;