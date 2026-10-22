import express, { Router } from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/matches", matchRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
