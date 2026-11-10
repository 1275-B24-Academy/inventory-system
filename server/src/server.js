import "dotenv/config";
import app from "./app.js";

// Render cấp cổng qua biến PORT.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
