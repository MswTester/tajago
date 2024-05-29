import { seedRandomInt } from "./utils";

const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon']

export class Game{
    roomID:string; // The room ID
    players:Player[]; // The players in the game
    isRank:boolean; // The rank status of the game
    status:string; // waiting, ready, playing
    seed:number; // The seed of the game

    spawnDelay:number = 3000; // The delay between spawns
    maxBlocks:number = 10; // The maximum number of blocks

    lastMotion:[number, number] = [0, 0]; // The [time, idx] of the last motion
    attacked:boolean = false; // The attacked status
    constructor(roomID:string, players:Player[], isRank:boolean = false){
        this.roomID = roomID;
        this.players = players;
        this.isRank = isRank;
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
            this.begin();
            return true;
        } else {
            return false;
        }
    }

    begin(){
        this.status = 'ready';
        this.lastMotion = [Date.now(), 0];
    }

    start(){
        this.status = 'playing';
        this.players.forEach(player => {
            player.init();
            player.spawned = Date.now();
        })
    }

    checkSpawn():string[]{
        let spawn:string[] = [];
        this.players.forEach(player => {
            if(Date.now() - player.spawned > this.spawnDelay){
                player.spawned = player.spawned + this.spawnDelay;
                player.spawnedCount += 1;
                player.queue.push(new WordBlock(words[seedRandomInt(this.seed*player.spawnedCount, 0, words.length)]));
                spawn.push(player.socketID);
            }
        })
        return spawn;
    }

    checkDeath():string{
        let str:string = '';
        this.players.forEach(player => {
            if(player.queue.length > this.maxBlocks){
                this.gameOver(player.socketID);
                str =  player.socketID;
            }
        })
        return str;
    }

    gameOver(socketID:string){
        const win_player = this.players.find(player => player.socketID != socketID);
        const lose_player = this.players.find(player => player.socketID == socketID);
        win_player.init();
        lose_player.init();
        win_player.score += 1;
        this.lastMotion = [Date.now(), 0];
        this.status = 'ready';
    }

    checkAttack():boolean{
        let _res:boolean = false;
        this.players.forEach(player => {
            if(player.attackQueue.length > 0){
                player.attackQueue.forEach(attack => {
                    if(Date.now() - attack[1] > 1000){
                        player.spawned -= attack[0] * this.spawnDelay / 10;
                        player.attackQueue.shift();
                        _res = true;
                    }
                })
            }
        })
        return _res;
    }

    tick():{[key:string]:any}{
        if(this.status == 'playing'){
            let _res:{[key:string]:any} = {}
            let checkSpawn = this.checkSpawn()
            if(checkSpawn.length > 0) {
                _res['players'] = this.players;
                _res['spawn'] = checkSpawn;
            }
            let gameOver = this.checkDeath();
            if(gameOver) _res['gameOver'] = gameOver;
            if(gameOver) _res['players'] = this.players;
            if(gameOver) delete _res['spawn'];
            if(this.checkAttack()) _res['players'] = this.players;
            if(this.attacked) {
                _res['players'] = this.players;
                this.attacked = false;
            };
            return _res;
        } else if(this.status == 'ready'){
            let _res:{[key:string]:any} = {};
            if(Date.now() - this.lastMotion[0] > 2000){
                this.lastMotion = [Date.now(), this.lastMotion[1] + 1];
                if(this.lastMotion[1] > 2){ // 3 * 2 seconds
                    this.start();
                    _res['players'] = this.players;
                }
                _res['waiting'] = this.lastMotion[1];
                return _res;
            }
        }
        return {};
    }

    attack(socketID:string, word:string):{enemy:string, attack:number}{
        const player = this.players.find(player => player.socketID == socketID);
        const enemy = this.players.find(player => player.socketID != socketID);
        if(player){
            const idx = player.queue.findIndex(v => v.word == word);
            if(idx == -1) {
                player.combo = 0
                return null;
            } else {
                this.attacked = true;
                player.combo += 1;
                enemy.attackQueue.push([word.length * (1+(player.combo/100)), Date.now()]);
                player.queue.splice(idx, 1);
                return {enemy: enemy.socketID, attack: word.length};
            }
        }
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
    attackQueue:[number, number][]; // The attack queue (length, time)
    spawned:number = Date.now(); // The last spawn time
    spawnedCount:number = 0; // The number of spawns
    constructor(socketID:string, name:string, rating:number){
        this.socketID = socketID;
        this.name = name;
        this.rating = rating;
        this.ready = false;
        this.score = 0;
        this.combo = 0;
        this.queue = [];
        this.attackQueue = [];
    }

    init(){
        this.combo = 0;
        this.queue = [];
        this.attackQueue = [];
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