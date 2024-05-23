import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebCanvas from "../components/-webCanvas";
import Obj from "~/data/obj";
import { useInterval, useWindowSize } from "usehooks-ts";
import { shadowToStyle } from "~/data/utils";

export default function Home() {
    const dispatch = useDispatch();
    const isFetching:boolean = useSelector((state:any) => state.isFetching)
    const user:IUser = useSelector((state:any) => state.user)
    const [state, setState] = useState<string>("play")
    const [once, setOnce] = useState<boolean>(false)
    const [backObjs, setBackObjs] = useState<Obj[]>([])
    const {width, height} = useWindowSize()
    const [cursorPos, setCursorPos] = useState<number[]>([0, 0])
    const matchRef = useRef<HTMLDivElement>(null)
    const [matchShadows, setMatchShadows] = useState<IShadow[]>([])

    const handleMouseMove = (e:MouseEvent) => {
        setCursorPos([e.clientX, e.clientY])
    }

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(matchRef.current) matchRef.current.style.animation = 'scale-up 0.7s ease-in-out'

            let bObjs:Obj[] = []
            
            const particleLoop = setInterval(() => {
                const obj = new Obj(
                    [Math.random() * width, height + 20],
                    [10, 10],
                    [1, 1],
                    0,
                    0.7,
                    [0.5, 0.5],
                    [10, 235, 255, 1],
                    100
                )
                obj.tag = 'particle'
                obj.setGlow(20, 5, 5, 0.05)
                bObjs.unshift(obj)
            }, 200);

            let shadows:IShadow[] = []

            for(let i = 0; i < 9; i++){
                const m = Math.floor(i / 3)
                let color:vec4 = [255, 255, 255, 1]
                color[m] = 20
                shadows.push({distance: [0, 0], blur:(i%3 + 1) * (10 + (m*2)), color})
            }

            const updateLoop = setInterval(() => {
                bObjs = bObjs.map(obj => {
                    if(obj.tag == 'particle'){
                        obj.velocity[0] += Math.random() * 0.2 - 0.1
                        obj.velocity[1] -= 0.05
                    }
                    obj.update()
                    return obj
                })
                bObjs = bObjs.filter(obj => !(obj.position[1] <= -20 && obj.tag == 'particle'))
                setBackObjs(bObjs)

                shadows = shadows.map((shadow, i) => {
                    shadow.distance[0] = Math.sin(Date.now() / 1000 * i + (0.01 * Math.random())) * 10
                    shadow.distance[1] = Math.cos(Date.now() / 1000 * i + (0.01 * Math.random())) * 10
                    return shadow
                })
                if(matchRef.current) matchRef.current.style.boxShadow = shadowToStyle(shadows) + ', inset 0 0 10px #000, inset 0 0 20px #000, inset 0 0 30px #000, inset 0 0 40px #000'

            }, 1000/60)

            document.addEventListener('mousemove', handleMouseMove)

            return () => {
                clearInterval(particleLoop)
                clearInterval(updateLoop)
                document.removeEventListener('mousemove', handleMouseMove)
            }
        }
    }, [once])

    return <>
        <div className="w-full h-full flex flex-col justify-center items-center fade">
            <WebCanvas idx={-1} objs={backObjs} bg="linear-gradient(85deg, #001, #205, #001)"/>
            {state === 'play' ? <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="w-96 h-96 rounded-full flex flex-col justify-center items-center gap-10 select-none cursor-pointer bg-[#fff0] hover:bg-[#fff2] transition" ref={matchRef}>
                    <div className="font-anton font-bold text-lg">{user.rating} R</div>
                    <div className="text-4xl font-anton font-bold">Match</div>
                </div>
            </div>:
            state === 'settings' ? <div>
            </div>:
            state === 'rank' ? <div>
            </div>:
            state === 'rooms' ? <div>
            </div>:
            null
            }
            <div className="fixed top-0 left-0 w-full h-full fade pointer-events-none">
                <div className="shar fixed" style={{left:`${cursorPos[0]}px`, top:`${cursorPos[1]}px`}}></div>
            </div>
        </div>
    </>;
}