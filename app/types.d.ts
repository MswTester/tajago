interface IUser{
    id:string;
    username:string;
    password:string;
    rating:number;
    friends:string[]; // User IDs
    pps:number[]; // press per second
    avc:number[]; // average combo
    acc:number[]; // accuracy
    wins:number;
    losses:number;
    admin:boolean;
    banned:boolean;
}

interface storeAction {
    type: string;
    value: any;
}

interface TextConfig{
    font?:string;
    size?:number;
    align?:string;
    color?:vec4;
    shadow?:number;
}

type vec2 = [number, number];
type vec3 = [number, number, number];
type vec4 = [number, number, number, number];

interface IShadow{
    distance:vec2;
    blur:number;
    color:vec4;
    inset?:boolean;
}

interface socketProps{
    socket:Socket;
    setSocket:React.Dispatch<React.SetStateAction<Socket|null>>;
}

/* Server Types */

interface IStat{
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