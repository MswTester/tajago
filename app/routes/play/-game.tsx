import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";
import WebCanvas from "../components/-webCanvas";
import Obj from "~/data/obj";
import { Player, WordBlock } from "server/src/game";
import { useWindowSize } from "usehooks-ts";
import { getEase, reversed, shadowToStyle, sumOf } from "~/data/utils";

const redBg = (len:number) => {
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
    const [score, setScore] = useState<[number, number]>([0, 0])
    const [spawn, setSpawn] = useState<boolean>(false)
    const [ovBg, setOvBg] = useState<string>('')
    const [ovObjs, setOvObjs] = useState<Obj[]>([])
    const overlayRef = useRef<HTMLDivElement>(null)
    const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})
    const [doing, setDoing] = useState<boolean>(false)
    const wRef = useRef<HTMLDivElement>(null)
    const [wText, setWText] = useState<string>('')
    const [onW, setOnW] = useState<boolean>(false)

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
                    [-0.5, -0.5],
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

            socket.on('start-game', (players:Player[]) => {
                console.log('Game Start')
                let _ovObjs:Obj[] = []

                players.sort((a, b) => a.socketID == socket.id ? -1 : 1).forEach((player, i) => {
                    const po = new Obj(
                        [25 + (i * 50), 30 + (i * 40)],
                        [500, 100],
                        [1, 1],
                        0,
                        1,
                        [-0.5, -0.5],
                        [255, 255, 255, 0],
                        0
                    )
                    po.relPos = true
                    po.setText(player.name, {font:'Anton', size:50, color:[255, 255, 255, 1], align:'center'})
                    _ovObjs.push(po)
                })
                const po = new Obj(
                    [50, 50],
                    [500, 100],
                    [1, 1],
                    0,
                    1,
                    [-0.5, -0.5],
                    [255, 255, 255, 0],
                    0
                )
                po.relPos = true
                po.setText("VS", {font:'Anton', size:50, color:[255, 255, 255, 1], align:'center'})
                _ovObjs.push(po)
                
                setOvObjs(_ovObjs)
                let _opacity = 0
                let _loop = setInterval(() => {
                    _opacity += 0.01
                    setOvBg(`rgba(0, 0, 0, ${_opacity/4})`)
                    _ovObjs.forEach((ovobj, i) => {
                        ovobj.position[0] = 25 + (i * 50) + getEase(_opacity, 'easeOutCubic') * (i ? -1 : 1) * 50
                    })
                    setOvObjs(_ovObjs)
                    if(_opacity/2 >= 0.5) clearInterval(_loop)
                }, 10)

                setMyPlayer(players.find(player => player.socketID == socket.id) || null)
            })

            socket.on('game-players', (players:Player[]) => {
                setMyPlayer(players.find(player => player.socketID == socket.id) || null)
                players = players.sort((a, b) => a.socketID == socket.id ? -1 : 1)
                setScore([players[0].score, players[1].score])
            })

            socket.on('game-spawn', (spawned:string[]) => {
                if(spawned.includes(socket.id as string)){
                    setSpawn(true)
                }
            })

            socket.on('game-gameOver', (socketId:string) => {
                console.log('Game Over', socketId)
                setDoing(false)
            })

            socket.on('game-waiting', (idx:number) => {
                console.log('Waiting', idx)
                if(idx == 1){
                    setOverlayStyle({animation:'fade-out 0.5s ease-in-out', opacity:0})
                    setTimeout(() => {
                        setOvBg('')
                        setOvObjs([])
                        setOverlayStyle({})
                    }, 500)
                } else if(idx == 2){
                    setWText('Ready')
                    setOnW(true)
                    if(wRef.current) wRef.current.style.animation = 'fade 0.5s ease-in-out'
                    if(wRef.current) wRef.current.addEventListener('animationend', () => {
                        if(wRef.current) wRef.current.style.animation = ''
                    })
                } else if (idx == 3){
                    setWText('Go!')
                    if(wRef.current) wRef.current.style.animation = 'go-out 0.5s ease-in-out'
                    if(wRef.current) wRef.current.addEventListener('animationend', () => {
                        setOnW(false)
                        if(wRef.current) wRef.current.style.animation = ''
                    })
                    setDoing(true)
                }
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
        const animate = () => {
            if(firstRef.current) firstRef.current.style.animation = ''
        }
        if(myPlayer && firstRef.current && spawn){
            console.log('Spawn')
            firstRef.current.style.animation = `spawn 0.5s ease-in-out`
            firstRef.current.addEventListener('animationend', () => {
                if(firstRef.current) firstRef.current.style.animation = ''
            })
            setSpawn(false)
            return () => {
                if(firstRef.current) firstRef.current.removeEventListener('animationend', animate)
            }
        }
    }, [myPlayer, spawn])

    return <div className="w-full h-full flex flex-row justify-center items-center overflow-hidden gap-4 fade">
        <WebCanvas idx={-1} objs={objs} bg="linear-gradient(86deg, #201, #402, #201)" />
        {/* Damage Gage */}
        {myPlayer && <div className="w-4 rounded-full border border-white shar4 overflow-hidden" style={{height:`${size-80}px`}}>
            {doing && <div className="w-full rounded-full bg-[#faa]" style={{height:`${(myPlayer.attackQueue.reduce((a, b) => a + b[0], 0))}%`}}></div>}
        </div>}
        {/* PlayBox */}
        <div className="rounded-lg font-bold text-lg flex flex-col justify-center" style={{width:`${size/2}px`, height:`${size-80}px`}}>
            <div className="w-full h-full rounded-t-lg relative p-1 gap-1" style={{boxShadow:'inset 0 0 20px #f7f'}}>
                {myPlayer ? reversed(myPlayer.queue).map((v:WordBlock, i) => {
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
        {/* Spawn Cooltime */}
        {myPlayer && <div className="w-4 rounded-full border border-white shar4 overflow-hidden" style={{height:`${(size-80)/4}px`}}>
            {doing && <div className="w-full rounded-full bg-[#faf]" style={{height:`${(timeline - myPlayer?.spawned) / 30}%`}}></div>}
        </div>}
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
        {onW && <div className="absolute pointer-events-none flex flex-col justify-center items-center font-anton text-center text-2xl lg:text-4xl" style={{
            textShadow: '0 0 10px #ff09, 0 0 20px #ff08, 0 0 30px #ff07, 0 0 40px #ff06',
            color:'#ff0',
            top: `50%`, left: `50%`,
            transform: `translate(-50%, -50%)`,
        }} ref={wRef}>
            {wText}
        </div>}
        {myPlayer && redBg(myPlayer.queue.length)}
        <WebCanvas idx={20} objs={ovObjs} bg={ovBg} ref={overlayRef} style={overlayStyle} />
    </div>
}
