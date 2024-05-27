export class Game{
    roomID:string; // The room ID
    players:Player[]; // The players in the game
    isRank:boolean; // The rank status of the game
    status:string; // waiting, ready, playing
    seed:number; // The seed of the game
    
    spawned:number; // The time of the last spawn
    lastMotion:[number, number] = [0, 0]; // The [time, idx] of the last motion
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
        console.log(this.players)
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

    checkDeath():string{
        this.players.forEach(player => {
            if(player.queue.find(block => Date.now() - block.delta > 15000)){
                this.gameOver(player.socketID);
                return player.socketID;
            }
        })
        return '';
    }

    gameOver(socketID:string){
        const win_player = this.players.find(player => player.socketID != socketID);
        const lose_player = this.players.find(player => player.socketID == socketID);
        win_player.score += 1;
        this.status = 'ready';
        win_player.init();
        lose_player.init();
    }

    checkAttack():boolean{
        let _res:boolean = false;
        this.players.forEach(player => {
            if(player.attackQueue.length > 0){
                player.attackQueue.forEach(attack => {
                    if(Date.now() - attack[1] > 1000){
                        player.queue.forEach(block => {
                            block.delta -= attack[0] * 100;
                        })
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
            if(this.checkSpawn()) {
                _res['players'] = this.players;
                _res['spawn'] = true;
            }
            let gameOver = this.checkDeath();
            if(gameOver) _res['gameOver'] = gameOver;
            if(gameOver) _res['players'] = this.players;
            if(this.checkAttack()) _res['players'] = this.players;
            return _res;
        } else if(this.status == 'ready'){
            if(Date.now() - this.lastMotion[0] > 2000){
                this.lastMotion = [Date.now(), this.lastMotion[1] + 1];
                if(this.lastMotion[1] > 2){ // 3 * 2 seconds
                    this.start();
                }
                return {"waiting": this.lastMotion[1]};
            }
        }
        return {};
    }

    attack(socketID:string, word:string):{enemy:string, attack:number}{
        const player = this.players.find(player => player.socketID == socketID);
        const enemy = this.players.find(player => player.socketID != socketID);
        if(player){
            player.queue = player.queue.filter(block => block.word != word);
            enemy.attackQueue.push([word.length, Date.now()]);
            return {enemy: enemy.socketID, attack: word.length};
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
    attackQueue:[number, number][]; // The attack queue
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