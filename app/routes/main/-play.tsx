import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Socket } from "socket.io-client"
import { shadowToStyle } from "~/data/utils"

export default function PlayState(props:{socket:Socket;homeRef:React.RefObject<HTMLDivElement>}) {
    const dispatch = useDispatch()
    const user:IUser = useSelector((state:any) => state.user)
    const isFetching:boolean = useSelector((state:any) => state.isFetching)
    const homeState:string = useSelector((state:any) => state.homeState)
    const matchRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)
    const socket:Socket = props.socket
    const isMatching:boolean = useSelector((state:any) => state.isMatching)
    const [matchFound, setMatchFound] = useState<boolean>(false)
    const backShadowRef = useRef<HTMLDivElement>(null)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(matchRef.current) matchRef.current.style.animation = 'main-up 0.3s ease-in-out'

            let shadows:IShadow[] = []

            for(let i = 0; i < 9; i++){
                const m = Math.floor(i / 3)
                let color:vec4 = [255, 255, 255, 1]
                color[m] = 50
                shadows.push({distance: [0, 0], blur:(i%3 + 1) * (10 + (m*2)), color})
            }

            const updateLoop = setInterval(() => {
                if(document.hidden) return
                shadows = shadows.map((shadow, i) => {
                    shadow.distance[0] = Math.sin(Date.now() / 1000 * i + (1 * Math.random())) * (10 + i * 2)
                    shadow.distance[1] = Math.cos(Date.now() / 1000 * i + (1 * Math.random())) * (10 + i * 2)
                    return shadow
                })
                if(matchRef.current) matchRef.current.style.boxShadow = shadowToStyle(shadows) + ', inset 0 0 20px #000a, inset 0 0 40px #000a, inset 0 0 60px #000a'
            }, 1000 / 60)

            socket.on('match', () => {
                dispatch({type:'isMatching', value:true})
                if(matchRef.current) {
                    matchRef.current.style.animation = 'matched 0.5s ease-in-out'
                    matchRef.current.classList.add('matched')
                    matchRef.current.addEventListener('animationend', () => {
                        if(matchRef.current) {
                            matchRef.current.style.removeProperty('animation')
                        }
                    }, {once: true})
                }
            })
            socket.on('cancel-match', () => {
                dispatch({type:'isMatching', value:false})
                if(matchRef.current) {
                    matchRef.current.style.animation = 'matched 0.4s ease-in-out reverse'
                    matchRef.current.classList.remove('matched')
                    matchRef.current.addEventListener('animationend', () => {
                        if(matchRef.current) {
                            matchRef.current.style.removeProperty('animation')
                        }
                    }, {once: true})
                }
            })

            socket.on('match-found', (roomId:string) => {
                setMatchFound(true)
                setTimeout(() => {
                    dispatch({type:'isMatching', value:false})
                    dispatch({type:'roomId', value:roomId})
                    dispatch({type:'page', value:'play'})
                }, 1500);
                setTimeout(() => {
                    if(props.homeRef.current) props.homeRef.current.style.animation = 'fade-out 0.55s ease-in-out'
                }, 1000);
                if(matchRef.current){
                    matchRef.current.style.animation = 'match-found 0.5s ease-in-out'
                    matchRef.current.classList.add('match-found')
                }
                if(backShadowRef.current){
                    backShadowRef.current.style.animation = 'back-shadow 1s ease-in-out'
                }
            })
            
            return () => {
                clearInterval(updateLoop)
                socket.off('match')
                socket.off('cancel-match')
                socket.off('match-found')
            }
        }
    }, [once])

    useEffect(() => {
        if(homeState !== 'play' && matchRef.current) matchRef.current.style.animation = 'main-down 0.3s ease-in-out'
    }, [homeState])

    const handleMatch = () => {
        if(isFetching) return;
        if(matchFound) return;
        if(isMatching) {
            socket.emit('cancel-match')
        } else {
            socket.emit('match', {
                id: user.id,
                name: user.username,
                rating: user.rating
            })
        }
    }

    return <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="match w-96 h-96 rounded-full flex flex-col justify-center items-center gap-10 select-none cursor-pointer transition" ref={matchRef} onClick={handleMatch}>
            <div className="font-anton font-bold text-lg">{user.rating} R</div>
            <div className="text-4xl font-anton font-bold">{isMatching ? matchFound ? "Match Found!" : "Finding Match..." : "Match"}</div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" ref={backShadowRef}></div>
    </div>
}