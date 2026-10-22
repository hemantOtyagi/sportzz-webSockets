import http from "http";
import express, { Router } from "express";
import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";
const app = express();
const server = http.createServer(app);

// JSON middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running at ${baseUrl}`);
  console.log(
    `WebSocket sever is running on ${baseUrl.replace('http', 'ws')}/ws`
  );
});
