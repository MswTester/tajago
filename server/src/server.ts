interface IStat{
  pps:number;
  avc:number;
  acc:number;
  wins:number;
  losses:number;
}

interface IGame{
  roomID:string; // owner's socketID
  players:string[]; // socketIDs
  scores:number[];
  winner:string;
}

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";


const app = express();
const server = createServer(app);

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Access-Control-Allow-Origin']
}

const io = new Server(server, {
  cors: corsOptions
});

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("server is running");
})

let onlines: {[key:string]:string} = {} // socketID:userID
let rooms: {[key:string]:string[]} = {} // socketID(roomID) : [socketID]
let matches: {[key:string]:IStat} = {} // socketID : IStats
let games: IGame[] = [] // IGame[]

io.on("connection", (socket:Socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});