import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";


export default function Game(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch();
    const user:IUser = useSelector((state:any) => state.user)
    const roomId:string = useSelector((state:any) => state.roomId)
    const room:IRoom = useSelector((state:any) => state.room)
    const [once, setOnce] = useState<boolean>(false)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            socket.emit('game-ready', roomId)

            socket.on('start', () => {
                // dispatch({type:'homeState', value:'game'})
            })
            return () => {
                socket.off('start')
            }
        }
    }, [once])

    return <div className="w-full h-full flex flex-col justify-center items-center p-20">
    </div>
}