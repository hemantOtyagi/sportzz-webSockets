import http from "http";
import express from "express";
import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

// Middleware (order matters: security first, then body parsing)
app.use(securityMiddleware());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/matches", matchRouter);

// WebSocket
const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running at ${baseUrl}`);
  console.log(`WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`);
});