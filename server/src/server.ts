export interface IStat{
  id:string; // userID
  rating:number; // rating
  name:string; // username
}

interface IMatch{
  roomID:string;
  userID:string;
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
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";

const uri = readFileSync('.env', 'utf8').split('=')[1] || readFileSync('../.env', 'utf8').split('\n').find(v => v.split('=')[0] == 'MONGO_URI').split('=')[1] || 'mongodb+srv://realtime:EhcTmV54vQFH0AXq@cluster0.qo3ekyu.mongodb.net/';
const client = new MongoClient(uri);

const main = async () => {
  await client.connect();
  console.log("Connected to MongoDB");
  const db = client.db('tajago');
  const users = db.collection('users');

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
  const maxTimeout:number = 100000; // 100s

  app.get("/", (req, res) => {
    res.send("server is running");
  })

  let onlines: {[key:string]:string} = {} // socketID:userID
  let rooms: {[key:string]:IRoom} = {} // socketID(roomID) : [socketID]
  let matches: {[key:string]:IMatch} = {} // socketID : IMatch
  let games: Game[] = [] // Game[]

  const InRange = (a:number, b:number, range:number) => {
    return Math.abs(a - b) < range
  }
  setInterval(() => {
    Object.keys(matches).forEach((key:string) => {
      const match = matches[key]
      if(!match) return
      if(Date.now() - match.time > maxTimeout){
        delete matches[key]
        io.to(key).emit('cancel-match')
        io.to(key).emit('error', 'Matchmaking timeout')
      } else {
        Object.keys(matches).forEach((key2:string) => {
          const match2 = matches[key2]
          if(key != key2 && InRange(match.rating, match2.rating, Date.now() - match.time)){
            const arr:IMatch[] = [matches[key], matches[key2]]
            delete matches[key]
            delete matches[key2]
            const roomID = Math.random().toString(36).substring(2, 15)
            games.push(new Game(roomID, arr.map(v => new Player(v.roomID, v.name, v.rating)), true))
            io.to(key).emit('match-found', roomID)
            io.to(key2).emit('match-found', roomID)
            io.to(key).socketsJoin(roomID)
            io.to(key2).socketsJoin(roomID)
          }
        })
      }
    })

    games.forEach((game) => {
      const tick = game.tick()
      Object.keys(tick).forEach(async (key) => {
        const value = tick[key];
        io.to(game.roomID).emit(`game-${key}`, value)
        if(key == 'finished'){
          const rating = value.rating
          if(value.isRank){
            await users.updateOne({id:onlines[value.winner]}, {$inc:{rating:rating[0], wins:1}})
            await users.updateOne({id:onlines[game.players.find(player => player.socketID != value.winner).socketID]}, {$inc:{rating:rating[1], loses:1}})
          }
          io.to(game.roomID).socketsLeave(game.roomID)
          games = games.filter(g => g.roomID != game.roomID)
        }
      })
    })
  }, 1000/30)

  io.on("connection", (socket:Socket) => {
    console.log("a user connected:", socket.id);
    socket.on('online', (data:string) => {
      onlines[socket.id] = data
    })

    socket.on('match', (data:IStat) => {
      matches[socket.id] = {
        roomID: socket.id,
        userID: data.id,
        name: data.name,
        rating: data.rating,
        time: Date.now(),
      }
      socket.emit('match')
    })

    socket.on('cancel-match', () => {
      delete matches[socket.id]
      socket.emit('cancel-match')
    })

    socket.on('game-ready', (roomID:string) => {
      const game = games.find(game => game.roomID == roomID)
      if(game){
        if(game.ready(socket.id)){
          io.to(roomID).emit('start-game', game.players)
        }
      }
    })

    socket.on('game-attack', (roomID:string, word:string) => {
      const game = games.find(game => game.roomID == roomID)
      if(game){
        const attack = game.attack(socket.id, word)
        if(attack){
          io.to(roomID).emit('game-attack', attack)
        }
      }
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
      socket.emit('create', rooms[socket.id])
      socket.broadcast.emit('get-rooms', rooms)
    })

    socket.on('join', (roomId:string, name:string, rating:number) => {
      if(rooms[roomId]){
        if(rooms[roomId].players.length >= 2){
          socket.emit('error', 'Room is full')
        }
        rooms[roomId].players.push({
          socketID: socket.id,
          name, rating
        })
        socket.join(roomId)
        io.to(roomId).emit('update', rooms[roomId])
        socket.emit('join', roomId, rooms[roomId])
        socket.broadcast.emit('get-rooms', rooms)
      }
    })

    socket.on('start', (roomID:string) => {
      if(rooms[roomID].players.length < 2){
        socket.emit('error', 'Room is not full')
        return
      }
      const game = new Game(roomID, rooms[roomID].players.map(v => new Player(v.socketID, v.name, v.rating)))
      games.push(game)
      io.to(roomID).emit('start')
    })

    socket.on('leave', (roomId:string) => {
      if(rooms[roomId]){
        if(roomId == socket.id){
          io.to(roomId).emit('roomDestroyed')
          io.to(roomId).socketsLeave(roomId)
          delete rooms[roomId]
        } else {
          socket.emit('roomDestroyed')
          socket.leave(roomId)
          rooms[roomId].players = rooms[roomId].players.filter((player) => player.socketID != socket.id)
          io.to(roomId).emit('update', rooms[roomId])
        }
        socket.broadcast.emit('get-rooms', rooms)
      }
    })

    socket.on('chat', (roomID:string, name:string, chat:string) => {
      io.to(roomID).emit('chat', [name, chat])
    })

    socket.on('get-rooms', () => {
      socket.emit('get-rooms', rooms)
    })

    socket.on("disconnect", async () => {
      console.log("user disconnected:", socket.id);
      if(rooms[socket.id]){
        io.to(socket.id).emit('roomDestroyed')
        io.to(socket.id).socketsLeave(socket.id)
        delete rooms[socket.id]
        socket.broadcast.emit('get-rooms', rooms)
      }
      if(Object.values(rooms).find(room => room.players.find(player => player.socketID == socket.id))){
        Object.keys(rooms).forEach((key) => {
          rooms[key].players = rooms[key].players.filter(player => player.socketID != socket.id)
          io.to(key).emit('update', rooms[key])
        })
      }
      if(matches[socket.id]){
        delete matches[socket.id]
      }
      const game = games.find(game => game.players.find(player => player.socketID == socket.id))
      if(game){
        const winner = game.players[0].socketID
        const rating = game.getRewardRating(winner)
        io.to(game.roomID).emit('game-finished', {isRank:game.isRank, rating, winner, players:game.players})
        await users.updateOne({id:onlines[winner]}, {$inc:{rating:rating[0], wins:1}})
        await users.updateOne({id:onlines[socket.id]}, {$inc:{rating:rating[1], loses:1}})
        io.to(game.roomID).socketsLeave(game.roomID)
        games = games.filter(g => g != game)
      }
      delete onlines[socket.id]
    });
  });

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

main().catch(console.error);