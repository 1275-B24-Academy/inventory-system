require("dotenv").config();
const cookieParser = require("cookie-parser");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const errorHandler = require("./middlewares/errorHandler");
const requireLogin = require("./middlewares/requireLogin");

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/products", requireLogin, productRoutes);


app.use(errorHandler);

module.exports = app;