import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import paymentRoute from "./routes/payment.route.js";
import bookRoute from "./routes/book.route.js"

const app = express();

app.use(cors({ 
  origin: ["http://localhost:5173", "https://estate-ugsp.onrender.com"],
  credentials: true, 
  methods: 'GET,HEAD,PATCH,PUT,POST,DELETE', 
  allowedHeaders: 'Content-Type,Authorization' 
}));
app.use(express.json());
app.use(cookieParser());

// ADD THIS ROOT ROUTE HANDLER
app.get('/', (req, res) => {
  res.json({ 
    message: 'Estate API Server is running!',
    status: 'success',
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/posts',
      '/api/chats',
      '/api/messages',
      '/api/payment',
      '/api/book'
    ]
  });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/book", bookRoute);

// FIX PORT CONFIGURATION FOR RENDER
const PORT = process.env.PORT || 8800;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}!`);
});
