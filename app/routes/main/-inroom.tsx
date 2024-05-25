import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";


export default function InRoom(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch()
    const user = useSelector((state:any) => state.user)
    const room = useSelector((state:any) => state.room)
    
    return <div>
        
    </div>
}