import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type'],
  credentials: true
}

const io = new Server(server, {
    cors: corsOptions
});

const port = process.env.PORT || 8080;

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("server is running");
})

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});