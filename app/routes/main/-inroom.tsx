import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";


export default function InRoom(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch()
    const user:IUser = useSelector((state:any) => state.user)
    const room:IRoom = useSelector((state:any) => state.room)
    const roomId:string = useSelector((state:any) => state.roomId)
    const homeState:string = useSelector((state:any) => state.homeState)
    const page:string = useSelector((state:any) => state.page)
    const [once, setOnce] = useState<boolean>(false)
    const [chats, setChats] = useState<[string, string][]>([])
    const chatRef = useRef<HTMLDivElement>(null)
    const [chat, setChat] = useState<string>('')
    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)


    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(leftRef.current) leftRef.current.style.animation = 'left-up 0.3s ease-out'
            if(rightRef.current) rightRef.current.style.animation = 'right-up 0.3s ease-out'
            if(topRef.current) topRef.current.style.animation = 'top-up 0.3s ease-out'

            socket.on('start', () => {
                dispatch({type:'page', value:'play'})
            })
            socket.on('roomDestroyed', () => {
                dispatch({type:'homeState', value:'rooms'})
                if(leftRef.current) leftRef.current.style.animation = 'left-down 0.3s ease-in'
                if(rightRef.current) rightRef.current.style.animation = 'right-down 0.3s ease-in'
                if(topRef.current) topRef.current.style.animation = 'top-down 0.3s ease-in'
            })
            socket.on('update', (room:IRoom) => {
                dispatch({type:'room', value:room})
            })
            let _chats:[string, string][] = []
            socket.on('chat', (_chat:[string, string]) => {
                _chats = [..._chats, _chat]
                console.log(_chats)
                setChats(_chats)
            })
            return () => {
                socket.off('start')
                socket.off('roomDestroyed')
                socket.off('update')
                socket.off('chat')
            }
        }
    }, [once])

    useEffect(() => {
        if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [chats])
    
    return <div className="w-full h-full flex flex-row justify-between items-center overflow-hidden">
        <div className="w-48 lg:w-96 h-full flex flex-col justify-start items-center gap-2 select-none p-2 overflow-y-auto overflow-x-hidden rounded-xl" ref={leftRef}>
            {room.players.map((player:InRoomPlayer, i:number) => {
                return <div key={i} className="w-full flex flex-row justify-between items-center p-2 rounded-md shar3 hover:bg-[#fff2] cursor-pointer">
                    <p className="text-lg font-bold">{player.name}</p>
                    <p className="text-sm">{player.rating} R</p>
                </div>
            })}
        </div>
        <div className="flex-1 w-full h-full flex flex-col justify-center items-center gap-2 select-none" ref={topRef}>
            {/* room name and settings */}
            <p className="text-2xl lg:text-4xl font-bold font-black-han-sans">{room.name}</p>
            <p className="text-lg lg:text-xl text-neutral-400">{room.private ? 'Private' : 'Public'}</p>
            <p className="text-lg lg:text-xl text-neutral-400">{room.players.length} Players</p>
        </div>
        <div className="w-48 lg:w-96 h-full flex flex-col justify-center items-center p-2 rounded-lg gap-1" ref={rightRef}>
            <div className="shar3 w-full h-full flex flex-col justify-start items-center gap-1 overflow-y-auto overflow-x-hidden rounded-md p-2 bg-[#0007]" ref={chatRef}>
                {chats.map((chat:[string, string], i:number) => {
                    return <p key={i} className="w-full text-wrap text-left">[{chat[0]}] {chat[1]}</p>
                })}
            </div>
            <input type="text" name="" id="" className="p-2 rounded-md w-full" placeholder="Chat" value={chat} onChange={e => setChat(e.target.value)} onKeyDown={e => {
                if(e.key == 'Enter'){
                    if(chat.trim().length == 0) return
                    socket.emit('chat', roomId, user.username, chat)
                    setChat('')
                }
            }} />
            {roomId == socket.id && <button className="p-2 rounded-md w-full" onClick={e => {
                socket.emit('start', roomId)
            } }>Start</button>}
            <button className="p-2 rounded-md w-full" onClick={e => {
                socket.emit('leave', roomId)
            }}>Leave</button>
        </div>
    </div>
}