import { Socket } from "socket.io";

export class Game{
    roomID:string; // The room ID
    players:Player[]; // The players in the game
    status:string; // waiting, playing
    seed:number; // The seed of the game
    
    spawned:number; // The time of the last spawn
    constructor(roomID:string, players:Player[]){
        this.roomID = roomID;
        this.players = players;
        this.status = 'waiting';
        this.seed = Math.random();
    }

    ready(socketID:string):boolean{
        this.players.forEach(player => {
            if(player.socketID == socketID){
                player.ready = true;
            }
        })
        if(this.players.every(player => player.ready)){
            this.start();
            return true;
        } else {
            return false;
        }
    }

    start(){
        this.status = 'playing';
        this.spawned = Date.now();
    }

    checkSpawn():boolean{
        if(Date.now() - this.spawned > 3000){
            this.spawned = Date.now();
            this.players.forEach(player => {
                player.queue.push(new WordBlock('test'));
            })
            return true;
        } else {
            return false;
        }
    }

    checkDeath(){
        this.players.forEach(player => {
            if(player.queue.find(block => Date.now() - block.delta > 15000)){
                // Player is dead
            }
        })
    }

    gameOver(socketID:string){
        this.players.forEach(player => {
            if(player.socketID == socketID){
                player.ready = false;
            }
        })
        if(this.players.every(player => !player.ready)){
            this.status = 'waiting';
        }
    }

    tick(){
    }
}

export class Player{
    socketID:string; // The socket ID of the player
    name:string; // The name of the player
    rating:number; // The rating of the player
    ready:boolean; // The ready status of the player
    score:number; // The score of the player
    combo:number; // The combo of the player
    queue:WordBlock[]; // The queue of the word blocks
    attackQueue:number[]; // The attack queue
    constructor(socketID:string, name:string, rating:number){
        this.socketID = socketID;
        this.name = name;
        this.rating = rating;
        this.ready = false;
        this.score = 0;
        this.combo = 0;
        this.queue = [];
    }
}

export class WordBlock{
    word:string; // The word of the block
    delta:number; // created at Date.now()
    constructor(word:string){
        this.word = word;
        this.delta = Date.now();
    }
}