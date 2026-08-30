import app from "./app.js";
const PORT = process.env.PORT || 8000;
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port https://localhost:${PORT}`);
});
