import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { shadowToStyle } from "~/data/utils"

export default function PlayState() {
    const user = useSelector((state:any) => state.user)
    const matchRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)
    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(matchRef.current) matchRef.current.style.animation = 'scale-up 0.7s ease-in-out'
            
            let shadows:IShadow[] = []

            for(let i = 0; i < 9; i++){
                const m = Math.floor(i / 3)
                let color:vec4 = [255, 255, 255, 1]
                color[m] = 20
                shadows.push({distance: [0, 0], blur:(i%3 + 1) * (10 + (m*2)), color})
            }

            const updateLoop = setInterval(() => {
                
                shadows = shadows.map((shadow, i) => {
                    shadow.distance[0] = Math.sin(Date.now() / 1000 * i + (0.01 * Math.random())) * 10
                    shadow.distance[1] = Math.cos(Date.now() / 1000 * i + (0.01 * Math.random())) * 10
                    return shadow
                })
                if(matchRef.current) matchRef.current.style.boxShadow = shadowToStyle(shadows) + ', inset 0 0 10px #000, inset 0 0 20px #000, inset 0 0 30px #000, inset 0 0 40px #000'
            }, 1000 / 60)

            return () => {
                clearInterval(updateLoop)
            }
        }
    }, [once])
    return <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="w-96 h-96 rounded-full flex flex-col justify-center items-center gap-10 select-none cursor-pointer bg-[#fff0] hover:bg-[#fff2] transition" ref={matchRef}>
            <div className="font-anton font-bold text-lg">{user.rating} R</div>
            <div className="text-4xl font-anton font-bold">Match</div>
        </div>
    </div>
}