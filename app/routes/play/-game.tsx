import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";
import WebCanvas from "../components/-webCanvas";
import Obj from "~/data/obj";
import { Player } from "server/src/game";
import { useWindowSize } from "usehooks-ts";
import { shadowToStyle } from "~/data/utils";

const redBg = (myPlayer:Player) => {
    const len = myPlayer.queue.length
    const val = len > 5 ? (len-5)*1 : "0"
    return <div className="absolute w-full h-full top-0 left-0 pointer-events-none" style={{
        boxShadow: `inset 0 0 50px #f00${val}`,
    }}></div>
}

export default function Game(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch();
    const user:IUser = useSelector((state:any) => state.user)
    const roomId:string = useSelector((state:any) => state.roomId)
    const room:IRoom = useSelector((state:any) => state.room)
    const [once, setOnce] = useState<boolean>(false)
    const [objs, setObjs] = useState<Obj[]>([])
    const [frontObjs, setFrontObjs] = useState<Obj[]>([])
    const [myPlayer, setMyPlayer] = useState<Player|null>(null)
    const [timeline, setTimeline] = useState<number>(0) // Date.now()
    const {width, height} = useWindowSize()
    const size = Math.min(width, height)
    const circleRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState<string>('')
    const firstRef = useRef<HTMLDivElement>(null)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            console.log(roomId)
            socket.emit('game-ready', roomId)
            let width = window.innerWidth
            let height = window.innerHeight
            let size = Math.min(width, height)
            const resize = () => {
                width = window.innerWidth
                height = window.innerHeight
                size = Math.min(width, height)
            }
            window.addEventListener('resize', resize)

            let _objs:Obj[] = []
            let _frontObjs:Obj[] = []
            let shadows:IShadow[] = []

            for(let i = 0; i < 9; i++){
                const m = Math.floor(i / 3)
                let color:vec4 = [255, 255, 255, 1]
                color[m] = 50
                shadows.push({distance: [0, 0], blur:(i%3 + 1) * (10 + (m*2)), color, inset:true})
            }

            const particleLoop = setInterval(() => {
                if(document.hidden) return
                const dis = Math.random() * 0.8 + 0.4
                const obj = new Obj(
                    [Math.random() * width, height + 20],
                    [dis*10, dis*10],
                    [1, 1],
                    0,
                    0.7,
                    [0.5, 0.5],
                    [230, 30, 255, 1],
                    100
                )
                obj.tag = 'particle'
                obj.customData['speed'] = dis/10
                obj.setGlow(20, 5, 5, 0.05)
                _objs.unshift(obj)
            }, 300);

            const updateLoop = setInterval(() => {
                setTimeline(Date.now())
                if(document.hidden) return
                _objs = _objs.map(obj => {
                    if(obj.tag == 'particle'){
                        obj.velocity[0] += Math.random() * 0.2 - 0.1
                        obj.velocity[1] -= obj.customData['speed']
                    }
                    obj.update()
                    return obj
                })
                _objs = _objs.filter(obj => !(obj.position[1] <= -20 && obj.tag == 'particle'))
                setObjs(_objs)
                setFrontObjs(_frontObjs)

                shadows = shadows.map((shadow, i) => {
                    shadow.distance[0] = Math.sin(Date.now() / 1000 * i) * (10 + i * 2)
                    shadow.distance[1] = Math.cos(Date.now() / 1000 * i) * (10 + i * 2)
                    return shadow
                })
                if(circleRef.current) circleRef.current.style.boxShadow = shadowToStyle(shadows)
            }, 1000/60)

            socket.on('start', () => {
                console.log('Game Start')
            })

            socket.on('game-players', (players:Player[]) => {
                setMyPlayer(players.find(player => player.socketID == socket.id) || null)
            })

            socket.on('game-spawn', () => {
                console.log('Spawn')
            })

            socket.on('game-gameOver', (socketId:string) => {
                console.log('Game Over', socketId)
            })

            socket.on('game-waiting', (idx:number) => {
                console.log('Waiting', idx)
            })

            socket.on('game-attack', (data:{enemy:string, attack:number}) => {
                console.log('Attack', data)
            })

            return () => {
                window.removeEventListener('resize', resize)
                clearInterval(particleLoop)
                clearInterval(updateLoop)
                socket.off('start')
                socket.off('game-players')
                socket.off('game-spawn')
                socket.off('game-gameOver')
                socket.off('game-waiting')
            }
        }
    }, [once])

    useEffect(() => {
        if(myPlayer && firstRef.current){
            firstRef.current.style.animation = `spawn 0.5s ease-in-out`
        }
    }, [myPlayer])

    return <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden fade">
        <WebCanvas idx={-1} objs={objs} bg="linear-gradient(86deg, #201, #402, #201)" />
        {/* PlayBox */}
        <div className="rounded-lg font-bold text-lg flex flex-col justify-center" style={{width:`${size/2}px`, height:`${size-80}px`}}>
            <div className="w-full h-full rounded-t-lg relative p-1 gap-1" style={{boxShadow:'inset 0 0 20px #f7f'}}>
                {myPlayer ? myPlayer.queue.map((v, i) => {
                    return <div key={i} className="w-full h-[10%] flex justify-center items-center text-center border-2 border-[#faf] rounded-lg"
                    style={{boxShadow:`inset 0 0 10px #f9f, 0 0 10px #f9f`
                    }} ref={i == 0 ? firstRef : null}>{v.word}</div>
                }) : null}
            </div>
            <input type="text" name="" id="" className="w-full rounded-b-lg p-2 text-center" value={input} onChange={e => setInput(e.target.value)} placeholder="Type Here"
            onKeyDown={e => {
                if(e.key === 'Enter'){
                    if(myPlayer){
                        socket.emit('game-attack', roomId, input)
                        setInput('')
                    }
                }
            }} />
        </div>
        <div ref={circleRef} className="absolute pointer-events-none rounded-full" style={{
            width: size*1.5, height: size*1.5,
            top: `50%`, left: `50%`,
            transform: `translate(-50%, -50%)`,
        }}></div>
        <WebCanvas idx={10} objs={frontObjs} />
        <div className="absolute w-full h-full top-0 left-0 pointer-events-none" style={{
            background: 'radial-gradient(50% 50% at 50% 50%, #0000, #0005)',
            mixBlendMode: 'overlay',
            animation: 'fade 0.3s ease-in-out',
        }}></div>
        {myPlayer && redBg(myPlayer)}
    </div>
}
