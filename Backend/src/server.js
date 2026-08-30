import app from "./app.js";
const PORT = process.env.PORT || 8000;
import connectDB from "../config/db.connection.js";

connectDB();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port https://localhost:${PORT}`);
});
