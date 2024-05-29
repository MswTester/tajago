import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Socket } from "socket.io-client";
import WebCanvas from "../components/-webCanvas";
import Obj from "~/data/obj";
import { Player, WordBlock } from "server/src/game";
import { useWindowSize } from "usehooks-ts";
import { getEase, reversed, shadowToStyle, sumOf } from "~/data/utils";

const redBg = (len:number) => {
    const val = len > 5 ? ((len-5)*2).toString(16) : "0"
    return <div className="absolute w-full h-full top-0 left-0 pointer-events-none" style={{
        boxShadow: `inset 0 0 50px #f00${val}`,
        transition: 'background 0.3s ease-in-out',
    }}></div>
}

export default function Game(props:socketProps) {
    const socket:Socket = props.socket
    const dispatch = useDispatch();
    const user:IUser = useSelector((state:any) => state.user)
    const roomId:string = useSelector((state:any) => state.roomId)
    const room:IRoom = useSelector((state:any) => state.room)
    const [once, setOnce] = useState<boolean>(false)
    const mainRef = useRef<HTMLDivElement>(null)
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
    const overlayRef = useRef<HTMLDivElement>(null)
    const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({})
    const [doing, setDoing] = useState<boolean>(false)
    const wRef = useRef<HTMLDivElement>(null)
    const [wText, setWText] = useState<string>('')
    const [onW, setOnW] = useState<boolean>(false)
    const [p1Txt, setP1Txt] = useState<string>('')
    const [p2Txt, setP2Txt] = useState<string>('')
    const [p1D, setP1D] = useState<number>(0)
    const [p2D, setP2D] = useState<number>(0)
    const [onOverlay, setOnOverlay] = useState<boolean>(true)
    const [onGameOver, setOnGameOver] = useState<boolean>(false)
    const [gameOverWinner, setGameOverWinner] = useState<string>('')
    const [gameOverStyle, setGameOverStyle] = useState<React.CSSProperties>({})
    const gameOverRef = useRef<HTMLDivElement>(null)
    const [playboxPos, setPlayboxPos] = useState<[number, number]>([0, 0])
    const gameOverScoreRef = useRef<HTMLDivElement>(null)
    const [scoreText, setScoreText] = useState<string>('0 - 0')
    const [onFinish, setOnFinish] = useState<boolean>(false)
    const finishRef = useRef<HTMLDivElement>(null)
    const [isWin, setIsWin] = useState<boolean>(false)
    const [isRank, setIsRank] = useState<boolean>(false)
    const [rewardRate, setRewardRate] = useState<string>("0")

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
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

                players.forEach((player, i) => {
                    if(player.socketID == socket.id){
                        setP1Txt(player.name)
                    } else {
                        setP2Txt(player.name)
                    }
                })

                let _d = 0
                let _loop = setInterval(() => {
                    _d += 0.01
                    setP1D(getEase(_d, 'easeInOutCubic'))
                    setP2D(getEase(_d, 'easeInOutCubic'))
                    setOverlayStyle({opacity:_d})
                    if(_d >= 1) clearInterval(_loop)
                }, 10)

                setMyPlayer(players.find(player => player.socketID == socket.id) || null)
            })

            socket.on('game-players', (players:Player[]) => {
                setMyPlayer(players.find(player => player.socketID == socket.id) || null)
                players = players.sort((a, b) => a.socketID == socket.id ? -1 : 1)
                setScoreText(`${players[0].score} - ${players[1].score}`)
            })

            socket.on('game-spawn', (spawned:string[]) => {
                if(spawned.includes(socket.id as string)){
                    setSpawn(true)
                }
            })

            socket.on('game-gameOver', (socketId:string) => {
                setDoing(false)
                setOnGameOver(true)
                setGameOverWinner(socketId == socket.id ? 'Enemy' : 'You')
            })

            socket.on('game-waiting', (idx:number) => {
                if(idx == 1){
                    setOverlayStyle({animation:'fade-out 0.5s ease-in-out', opacity:0})
                    setTimeout(() => {
                        setOnOverlay(false)
                        setOverlayStyle({})
                    }, 500)
                    setGameOverStyle({animation:'fade-out 0.5s ease-in-out', opacity:0})
                    setTimeout(() => {
                        setOnGameOver(false)
                        setGameOverWinner('')
                        setGameOverStyle({})
                    }, 500)
                } else if(idx == 2){
                    setWText('Ready')
                    setOnW(true)
                    if(wRef.current) wRef.current.style.animation = 'fade 0.5s ease-in-out'
                    if(wRef.current) wRef.current.addEventListener('animationend', () => {
                        if(wRef.current) wRef.current.style.animation = ''
                    }, {once:true})
                } else if (idx == 3){
                    setWText('Go!')
                    if(wRef.current) wRef.current.style.animation = 'go-out 0.5s ease-in-out'
                    if(wRef.current) wRef.current.style.opacity = '0'
                    if(wRef.current) wRef.current.addEventListener('animationend', () => {
                        setOnW(false)
                        if(wRef.current) wRef.current.style.animation = ''
                    }, {once:true})
                    setDoing(true)
                }
            })

            socket.on('game-attack', (data:{enemy:string, attack:number}) => {
                if(data.enemy == socket.id){
                    let _strength = data.attack
                    let _d = _strength / 10
                    let _loop = setInterval(() => {
                        _d -= _strength / 100
                        setPlayboxPos([Math.sin(Date.now() / 1000 * 10) * 10 * _d, Math.cos(Date.now() / 1000 * 10) * 10 * _d])
                        if(_d <= 0) {
                            setPlayboxPos([0, 0])
                            clearInterval(_loop)
                        }
                    }, 10)
                }
            })

            socket.on('game-finished', (data:{isRank:boolean, rating:[number, number], winner:string, players:Player[]}) => {
                setDoing(false)
                setOnFinish(true)
                setIsWin(data.winner == socket.id)
                setIsRank(data.isRank)
                setRewardRate(data.winner == socket.id ? `+${data.rating[0]}` : `${data.rating[1]}`)
                setTimeout(() => {
                    if(mainRef.current) {
                        mainRef.current.style.animation = 'fade-out 0.5s ease-in-out'
                        mainRef.current.style.opacity = '0'
                        mainRef.current.addEventListener('animationend', () => {
                            dispatch({type:'page', value:'home'})
                        }, {once:true})
                    }
                }, 2000);
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
                socket.off('game-attack')
                socket.off('game-finished')
            }
        }
    }, [once])

    useEffect(() => {
        const animate = () => {
            if(firstRef.current) firstRef.current.style.animation = ''
        }
        if(myPlayer && firstRef.current && spawn){
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

    useEffect(() => {
        if(gameOverRef.current) gameOverRef.current.style.animation = 'gameOver 1s ease-in-out'
        if(gameOverScoreRef.current) gameOverScoreRef.current.style.animation = 'gameOverScore 1s ease-in-out'
        return () => {
            if(gameOverRef.current) gameOverRef.current.style.animation = ''
            if(gameOverScoreRef.current) gameOverScoreRef.current.style.animation = ''
        }
    }, [onGameOver])

    const globalHeight = size - 160

    return <div className="w-full h-full flex flex-row justify-center items-center overflow-hidden gap-4 fade" ref={mainRef}>
        {/* Back Particle */}
        <WebCanvas idx={-1} objs={objs} bg="linear-gradient(86deg, #201, #402, #201)" />
        {/* Damage Gage */}
        {myPlayer && <div className="w-4 rounded-full border border-white shar4 overflow-hidden"
        style={{height:`${globalHeight}px`, transform:`translate(${playboxPos[0]}px, ${playboxPos[1]}px)`}}>
            {doing && <div className="w-full rounded-full bg-[#faa] trans" style={{height:`${(myPlayer.attackQueue.reduce((a, b) => a + b[0], 0))*4}%`,
            boxShadow:'0 0 10px #faa, 0 0 20px #faad, 0 0 30px #faab'}}></div>}
        </div>}
        {/* PlayBox */}
        <div className="rounded-lg font-bold text-lg flex flex-col justify-center"
        style={{width:`${size/2}px`, height:`${globalHeight}px`, transform:`translate(${playboxPos[0]}px, ${playboxPos[1]}px)`}}>
            <div className="w-full h-full rounded-t-lg relative p-1 gap-1" style={{boxShadow:'inset 0 0 20px #f7f'}}>
                {myPlayer ? reversed(myPlayer.queue).map((v:WordBlock, i) => {
                    return <div key={i} className="w-full h-[10%] flex justify-center items-center text-center border-2 border-[#faf] rounded-lg"
                    style={{boxShadow:`inset 0 0 10px #f9f, 0 0 10px #f9f`
                    }} ref={i == 0 ? firstRef : null}>{v.word}</div>
                }) : null}
            </div>
            <input type="text" name="" id="" className="w-full rounded-b-lg p-2 text-center" value={input}
            onChange={e => setInput(e.target.value)} placeholder="Type Here"
            onKeyDown={e => {
                if(e.key === 'Enter' || e.key === ' ') {
                    if(myPlayer){
                        socket.emit('game-attack', roomId, input.trim())
                        setInput('')
                    }
                }
            }} />
        </div>
        {/* Spawn Cooltime */}
        {myPlayer && <div className="w-4 rounded-full border border-white shar4 overflow-hidden"
        style={{height:`${(globalHeight)/4}px`, transform:`translate(${playboxPos[0]}px, ${playboxPos[1]}px)`}}>
            {doing && <div className="w-full rounded-full bg-[#faf]" style={{height:`${(timeline - myPlayer?.spawned) / 30}%`,
            boxShadow:'0 0 10px #faf, 0 0 20px #fafd, 0 0 30px #fafb'}}></div>}
        </div>}
        {/* Score board */}
        <div className="top-0 absolute w-24 rounded-b-lg flex flex-col justify-center items-center bg-[#000a] border-2 border-[#fdf] text-[#faf]"
        style={{boxShadow: `0 0 10px #fcf, 0 0 20px #fbf, 0 0 30px #faf`}}>{scoreText}</div>
        {/* Circle */}
        <div ref={circleRef} className="absolute pointer-events-none rounded-full" style={{
            width: size*1.5, height: size*1.5,
            top: `50%`, left: `50%`,
            transform: `translate(-50%, -50%)`,
        }}></div>
        {/* front particle */}
        <WebCanvas idx={10} objs={frontObjs} />
        {/* Mood Gradient Overlay */}
        <div className="absolute w-full h-full top-0 left-0 pointer-events-none" style={{
            background: 'radial-gradient(50% 50% at 50% 50%, #0000, #0005)',
            mixBlendMode: 'overlay',
            animation: 'fade 0.3s ease-in-out',
        }}></div>
        {/* Start Alert */}
        {onW && <div className="absolute pointer-events-none flex flex-col justify-center items-center font-anton text-center text-6xl lg:text-8xl" style={{
            textShadow: '0 0 10px #ff09, 0 0 20px #ff08, 0 0 30px #ff07, 0 0 40px #ff06',
            color:'#ff0',
            top: `50%`, left: `50%`,
            transform: `translate(-50%, -50%)`,
        }} ref={wRef}>
            {wText}
        </div>}
        {/* RedBG */}
        {myPlayer && redBg(myPlayer.queue.length)}
        {/* Players Match */}
        {onOverlay && <div className="absolute pointer-events-none w-full h-full top-0 left-0 fade" style={{...overlayStyle, background:'#000a'}} ref={overlayRef}>
            <div className="text-6xl lg:text-8xl text-[#ffa] absolute font-anton"
            style={{textShadow:"0 0 10px #ff99, 0 0 20px #ff88, 0 0 30px #ff77, 0 0 40px #ff66",
            transform:'translate(-50%, -50%)', top:`25%`, left:`${75 - (50 * p1D)}%`}}>{p1Txt}</div>
            <div className="text-6xl lg:text-8xl text-[#ffa] absolute font-anton"
            style={{textShadow:"0 0 10px #ff99, 0 0 20px #ff88, 0 0 30px #ff77, 0 0 40px #ff66",
            transform:'translate(-50%, -50%)', top:`50%`, left:`50%`}}>VS</div>
            <div className="text-6xl lg:text-8xl text-[#ffa] absolute font-anton"
            style={{textShadow:"0 0 10px #ff99, 0 0 20px #ff88, 0 0 30px #ff77, 0 0 40px #ff66",
            transform:'translate(-50%, -50%)', top:`75%`, left:`${25 + (50 * p2D)}%`}}>{p2Txt}</div>
        </div>}
        {/* Game Over */}
        {onGameOver && <div className="absolute pointer-events-none w-full h-full top-0 left-0 flex flex-col justify-center items-center fade"
        style={{...gameOverStyle, background:'rgba(0, 0, 0, 0.7)'}}>
            <div className="text-6xl lg:text-8xl text-[#faf] font-anton"
            style={{textShadow:"0 0 10px #f9f9, 0 0 20px #f8f8, 0 0 30px #f7f7, 0 0 40px #f6f6"}}
            ref={gameOverRef}>{gameOverWinner} Win!</div>
            <div className="text-3xl lg:text-4xl text-[#fff] absolute font-anton"
            style={{
                textShadow:"0 0 10px #fff6, 0 0 20px #fff5, 0 0 30px #fff4, 0 0 40px #fff3",
                bottom:`30%`, left:`50%`, transform:'translate(-50%, -50%)'
            }}
            ref={gameOverScoreRef}>{scoreText}</div>
        </div>}
        {/* Finish */}
        {onFinish && <div className="absolute pointer-events-none w-full h-full top-0 left-0 flex flex-col justify-center items-center gap-2 fade"
        style={{background:'rgba(0, 0, 0, 0.7)'}} ref={finishRef}>
            <div className="text-6xl lg:text-8xl text-[#faf] font-anton"
            style={{textShadow:"0 0 10px #f9f9, 0 0 20px #f8f8, 0 0 30px #f7f7, 0 0 40px #f6f6",
                animation:'f1 0.5s ease-in-out'
            }}>Finished!</div>
            <div className="text-3xl lg:text-4xl text-[#fff] font-anton"
            style={{textShadow:"0 0 10px #fff6, 0 0 20px #fff5, 0 0 30px #fff4, 0 0 40px #fff3",
                animation:'f2 0.5s ease-in-out 0.2s'
            }}>You {isWin ? "Win" : "Lose"}</div>
            {isRank && <div className="text-2xl lg:text-3xl text-[#ffa] font-anton"
            style={{textShadow:"0 0 10px #ff99, 0 0 20px #ff88, 0 0 30px #ff77, 0 0 40px #ff66",
                animation:'f3 0.5s ease-in-out 0.4s'
            }}>{rewardRate}</div>}
        </div>}
    </div>
}
