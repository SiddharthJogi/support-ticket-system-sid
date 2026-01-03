/* server/index.js */
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http"); // Native Node Module
const { Server } = require("socket.io"); // Socket.io Library

require("dotenv").config();

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 3. Socket Connection Logic
io.on("connection", (socket) => {
  console.log(`⚡: Client Connected: ${socket.id}`);

  // Join a room based on Role or User ID (Optional for advanced targeting)
  socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔥: Client Disconnected");
  });
});

// 4. Make 'io' accessible to our Routes
app.set("socketio", io); 

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/tickets", require("./routes/tickets"));

const PORT = process.env.PORT || 5000;

// IMPORTANT: Listen with 'server', not 'app'
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 