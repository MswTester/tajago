import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Socket } from "socket.io-client";


export default function RoomState(props:socketProps){
    const socket = props.socket;
    const dispatch = useDispatch();
    const mainRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)
    const homeState = useSelector((state:any) => state.homeState)
    const isFetching = useSelector((state:any) => state.isFetching)
    const [rooms, setRooms] = useState<{[key:string]:IRoom}>({})
    const [search, setSearch] = useState<string>('')
    const [onCreate, setOnCreate] = useState<boolean>(false)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'page-up 0.3s ease-in-out'
            socket.emit('get-rooms')

            socket.on('get-rooms', (rooms:{[key:string]:IRoom}) => {
                setRooms(rooms)
            })

            socket.on('create', (room:IRoom) => {
                setOnCreate(false)
                dispatch({type:'roomId', value:socket.id})
                dispatch({type:'room', value:room})
                dispatch({type:'homeState', value:'room'})
            })

            socket.on('join', (room:IRoom) => {
                dispatch({type:'roomId', value:socket.id})
                dispatch({type:'room', value:room})
                dispatch({type:'homeState', value:'room'})
            })

            return () => {
                socket.off('rooms')
            }
        }
    }, [once])

    useEffect(() => {
        if(homeState !== 'rooms' && mainRef.current) mainRef.current.style.animation = 'page-down 0.3s ease-in-out'
    }, [homeState])

    return <div className="w-full h-full flex flex-col justify-center items-center pt-10 pb-5">
        <div className="w-[60%] h-full flex flex-col justify-center items-center gap-2" ref={mainRef}>
            <div className="w-full flex flex-row justify-center items-center gap-2">
                <input className="rounded-md p-2 w-full" type="text" name="" id="" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
                <button className="rounded-md pr-8 pl-8 p-2 text-2xl" onClick={e => {
                    setOnCreate(!onCreate)
                }}>+</button>
            </div>
            <div className="w-full h-full fle-1 flex flex-col justify-start items-items gap-2">
                {Object.values(rooms).filter(room => room.name.includes(search)).map((room:IRoom, i:number) => {
                    return <div key={i} className="w-full flex flex-row justify-between items-center p-4 rounded-md shar3">
                        <div className="flex-1 text-xl">{room.name}</div>
                        <div className="flex-1 text-lg">{room.players.length}/2</div>
                        <button disabled={isFetching} className="rounded-md p-3 pr-10 pl-10" onClick={e => {
                            dispatch({type:'roomId', value:Object.keys(rooms).find(key => rooms[key] === room)})
                            dispatch({type:'room', value:room})
                            dispatch({type:'homeState', value:'room'})
                        }}>Join</button>
                    </div>
                })}
            </div>
        </div>
        {onCreate && <CreateRoom {...props} setOnCreate={setOnCreate} />}
    </div>
}

function CreateRoom (props:{socket:Socket;setOnCreate:(value:boolean) => void}) {
    const socket = props.socket;
    const dispatch = useDispatch();
    const user:IUser = useSelector((state:any) => state.user)
    const [name, setName] = useState<string>('')
    const [privateRoom, setPrivateRoom] = useState<boolean>(false)
    const [once, setOnce] = useState<boolean>(false)
    const mainRef = useRef<HTMLDivElement>(null)

    const createRoom = () => {
        if(name.trim().length < 3) return dispatch({type:'error', value:'Room name must be more than 3 characters long'})
        socket.emit('create', name, user.username, privateRoom, user.rating)
    }

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'fade 0.3s ease-in-out'
        }
    }, [once])

    return <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center pt-10 pb-5 bg-[#0009]" ref={mainRef} onMouseDown={e => {
        if(e.target === e.currentTarget) {
            if(mainRef.current) mainRef.current.style.animation = 'fade-out 0.3s ease-in-out'
            setTimeout(() => {
                props.setOnCreate(false)
            }, 290)
        }
    }}>
        <div className="w-96 flex flex-col justify-center items-center gap-2">
            <input className="rounded-md p-2 w-full" type="text" name="" id="" placeholder="Room Name" value={name} onChange={e => setName(e.target.value)} />
            <div className="w-full flex flex-row justify-center items-center gap-2">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => setPrivateRoom(!privateRoom)}>
                    {privateRoom && <div className="w-3 h-3 rounded-full bg-slate-500"></div>}
                </div>
                <div className="select-none">Private</div>
            </div>
            <button className="w-full rounded-md pr-8 pl-8 p-2 text-xl" onClick={createRoom}>Create</button>
        </div>
    </div>
}