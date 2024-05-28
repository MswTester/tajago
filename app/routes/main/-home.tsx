import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebCanvas from "../components/-webCanvas";
import Obj from "~/data/obj";
import PlayState from "./-play";
import { Socket } from "socket.io-client";
import Navbar from "./-navbar";
import SettingState from "./-settings";
import RankState from "./-rank";
import RoomState from "./-rooms";
import LeaderboardState from "./-leaderboard";
import InRoom from "./-inroom";

export default function Home(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch();
    const isFetching:boolean = useSelector((state:any) => state.isFetching)
    const user:IUser = useSelector((state:any) => state.user)
    const homeState:string = useSelector((state:any) => state.homeState)
    const [state, setState] = useState<string>('play')
    const [once, setOnce] = useState<boolean>(false)
    const [backObjs, setBackObjs] = useState<Obj[]>([])
    const [cursorPos, setCursorPos] = useState<number[]>([0, 0])
    const homeRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e:MouseEvent) => {
        setCursorPos([e.clientX, e.clientY])
    }

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            socket.emit('online', user.id)
            let bObjs:Obj[] = []
            let width = window.innerWidth
            let height = window.innerHeight
            const resize = () => {
                width = window.innerWidth
                height = window.innerHeight
            }
            window.addEventListener('resize', resize)

            const particleLoop = setInterval(() => {
                if(document.hidden) return
                const dis = Math.random() * 0.8 + 0.4
                const obj = new Obj(
                    [Math.random() * width, height + 20],
                    [dis*10, dis*10],
                    [1, 1],
                    0,
                    0.7,
                    [-0.5, -0.5],
                    [10, 235, 255, 1],
                    100
                )
                obj.tag = 'particle'
                obj.customData['speed'] = dis/10
                obj.setGlow(20, 5, 5, 0.05)
                bObjs.unshift(obj)
            }, 300);

            const updateLoop = setInterval(() => {
                if(document.hidden) return
                bObjs = bObjs.map(obj => {
                    if(obj.tag == 'particle'){
                        obj.velocity[0] += Math.random() * 0.2 - 0.1
                        obj.velocity[1] -= obj.customData['speed']
                    }
                    obj.update()
                    return obj
                })
                bObjs = bObjs.filter(obj => !(obj.position[1] <= -20 && obj.tag == 'particle'))
                setBackObjs(bObjs)
            }, 1000/60)

            document.addEventListener('mousemove', handleMouseMove)

            return () => {
                clearInterval(particleLoop)
                clearInterval(updateLoop)
                document.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('resize', resize)
            }
        }
    }, [once])

    useEffect(() => {
        setTimeout(() => {
            setState(homeState)
        }, 280);
    }, [homeState])

    const background = `linear-gradient(85deg, #001, #205, #001)`
    return <div className="w-full h-full flex flex-col justify-center items-center fade" ref={homeRef}>
        <WebCanvas idx={-1} objs={backObjs} bg={background} />
        {state === 'play' ? <PlayState {...props} homeRef={homeRef} />:
        state === 'settings' ? <SettingState {...props} />:
        state === 'rank' ? <RankState {...props} />:
        state === 'rooms' ? <RoomState {...props} />:
        state === 'leaderboard' ? <LeaderboardState {...props} />:
        state === 'room' ? <InRoom {...props} />:
        null}
        {state !== 'room' && <Navbar />}
        <div className="fixed top-0 left-0 w-full h-full fade pointer-events-none">
            <div className="shar fixed" style={{left:`${cursorPos[0]}px`, top:`${cursorPos[1]}px`}}></div>
        </div>
    </div>;
}