
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