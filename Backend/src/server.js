import "dotenv/config";
import app from "./app.js";
import { env } from "../config/env.js";
const PORT = env.port;
import connectDB from "../config/db.connection.js";

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port https://localhost:${PORT}`);
});
