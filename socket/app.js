import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server on top of HTTP server
const io = new Server(server, {
  cors: {
    origin: [
      "https://estate-ugsp.onrender.com",
      "http://localhost:5173",
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'HEAD', 'PATCH', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
});

// Add health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Socket server running',
    timestamp: new Date().toISOString(),
    connectedUsers: onlineUser.length
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("User added:", userId, "Socket:", socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log("Message sent from", socket.id, "to", receiver.socketId);
    } else {
      console.log("Receiver not found or offline:", receiverId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Socket server running on port ${port}`);
  console.log(`CORS configured for: ${process.env.CLIENT_URL || 'No CLIENT_URL set'}`);
});
