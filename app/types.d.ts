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
}

interface storeAction {
    type: string;
    value: any;
}

type vec2 = [number, number];
type vec3 = [number, number, number];
type vec4 = [number, number, number, number];

interface IShadow{
    distance:vec2;
    blur:number;
    color:vec4;
}

interface socketProps{
    socket:Socket;
    setSocket:React.Dispatch<React.SetStateAction<Socket|null>>;
}
