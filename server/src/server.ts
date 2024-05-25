export interface IStat{
  id:string; // userID
  rating:number; // rating
  name:string; // username
}

interface IMatch{
  roomID:string;
  rating:number;
  name:string; // username
  time:number; // Date.now()
}

interface IRoom{
  players:InRoomPlayer[];
  name:string;
  private:boolean;
  owner:string; // owner username
  status:string; // waiting, playing
}

interface InRoomPlayer{
  socketID:string;
  name:string;
  rating:number;
}

import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Game, Player } from "./game";


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
let rooms: {[key:string]:IRoom} = {} // socketID(roomID) : [socketID]
let matches: {[key:string]:IMatch} = {} // socketID : IMatch
let games: Game[] = [] // IGame[]

const InRange = (a:number, b:number, range:number) => {
  return Math.abs(a - b) < range
}
setInterval(() => {
  Object.keys(matches).forEach((key:string) => {
    const match = matches[key]
    if(Date.now() - match.time > 10000){
      delete matches[key]
    } else {
      Object.keys(matches).forEach((key2:string) => {
        const match2 = matches[key2]
        if(key != key2 && InRange(match.rating, match2.rating, Date.now() - match.time)){
          delete matches[key]
          delete matches[key2]
          const roomID = Math.random().toString(36).substring(2, 15)
          games.push(new Game(roomID, rooms[key].players.map(v => new Player(v.socketID, v.name, v.rating))))
          io.to(key).emit('match-found', roomID)
          io.to(key2).emit('match-found', roomID)
          io.to(key).socketsJoin(roomID)
          io.to(key2).socketsJoin(roomID)
        }
      })
    }
  })
}, 1000/30)

io.on("connection", (socket:Socket) => {
  console.log("a user connected");
  socket.on('online', (data:string) => {
    onlines[socket.id] = data
  })

  socket.on('match', (data:IStat) => {
    matches[socket.id] = {
      roomID: data.id,
      rating: data.rating,
      time: Date.now(),
      name: data.name
    }
    socket.emit('match')
  })

  socket.on('cancel-match', () => {
    delete matches[socket.id]
    socket.emit('cancel-match')
  })

  socket.on('match-ready', (roomID:string) => {
    
  })

  socket.on('create', (name:string, nick:string, pri:boolean, rating:number) => {
    rooms[socket.id] = {
      players: [{
        socketID: socket.id,
        name: nick,
        rating
      }],
      name: name,
      private: pri,
      owner: nick,
      status: 'waiting'
    }
    socket.join(socket.id)
    console.log(rooms)
    socket.emit('create', rooms[socket.id])
  })

  socket.on('join', (roomId:string, name:string, rating:number) => {
    if(rooms[roomId]){
      rooms[roomId].players.push({
        socketID: socket.id,
        name, rating
      })
      socket.join(roomId)
      io.to(roomId).emit('update', rooms[roomId])
      socket.emit('join', rooms[roomId])
    }
  })

  socket.on('start', (roomID:string) => {
    games.push(new Game(roomID, rooms[roomID].players.map(v => new Player(v.socketID, v.name, v.rating))))
    io.to(roomID).emit('start')
  })

  socket.on('leave', (data:string) => {
    if(rooms[data]){
      rooms[data].players = rooms[data].players.filter((player) => player.socketID != socket.id)
      socket.leave(data)
      socket.emit('roomDestroyed')
      socket.emit('get-rooms', rooms)
      io.to(data).emit('update', rooms[data])
    }
  })

  socket.on('get-rooms', () => {
    socket.emit('get-rooms', rooms)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete onlines[socket.id]
    if(rooms[socket.id]){
      rooms[socket.id].players.forEach((player) => {
        io.to(player.socketID).emit('roomDestroyed')
      })
      delete rooms[socket.id]
    }
    if(matches[socket.id]){
      delete matches[socket.id]
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});