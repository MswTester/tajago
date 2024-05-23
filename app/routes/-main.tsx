import { useDispatch, useSelector } from "react-redux";
import Login from "./main/-login";
import Error from "./components/-error";
import { useEffect, useState } from "react";
import Home from "./main/-home";
import { io, Socket } from "socket.io-client";

const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://tajago.onrender.com/'

export default function Main() {
    const dispatch = useDispatch();
    const [once, setOnce] = useState<boolean>(false)
    const page:string = useSelector((state:any) => state.page);
    const error:string = useSelector((state:any) => state.error);
    const socket:Socket = useSelector((state:any) => state.socket);
    const [errorOff, setErrorOff] = useState<boolean>(false)
    const [curTimer, setCurTimer] = useState<NodeJS.Timeout|null>(null)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            const socket = io(url)
            try{
                socket.on('connect', () => {
                    dispatch({type:'socket', value:socket})
                })
            } catch(err){
                dispatch({type:'error', value:'Failed to connect to socket server'})
            }
            return () => {
                socket.disconnect()
            }
        }
    }, [once])

    useEffect(() => {
        if(error){
            let timer = setTimeout(() => {
                setErrorOff(true)
                setTimeout(() => {
                    dispatch({type:'error', value:''})
                    setErrorOff(false)
                }, 700);
            }, 2000);
            setCurTimer(timer)
        }
    }, [error])

    useEffect(() => {
        return () => {
            if(curTimer){
                clearTimeout(curTimer)
            }
        }
    }, [curTimer])

    return <>{
        socket != null ? (
            page === 'login' ? <Login /> :
            page === 'home' ? <Home /> :
            <div className="w-full h-full flex justify-center items-center">Page not found</div>
        ): <div className="w-full h-full flex justify-end items-end text-sm">Connecting to server...</div>
    }
    {error && <Error message={error} animation={error ? errorOff ? "down" : "up" : ""} />}
    </>
}
