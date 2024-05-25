import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Socket } from "socket.io-client"

const stateMenus = ['rank', 'leaderboard', 'play', 'rooms', 'settings']

export default function Navbar() {
    const dispatch = useDispatch()
    const user:IUser = useSelector((state:any) => state.user)
    const socket:Socket = useSelector((state:any) => state.socket)
    const homeState:string = useSelector((state:any) => state.homeState)
    const isMatching:boolean = useSelector((state:any) => state.isMatching)
    const [once, setOnce] = useState<boolean>(false)
    const mainRef = useRef<HTMLDivElement>(null)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'up 0.3s ease-in-out'
        }
    }, [once])

    useEffect(() => {
        if(homeState === 'room'){
            if(mainRef.current) mainRef.current.style.animation = 'down 0.3s ease-in-out'
        }
    }, [homeState])

    return <nav className="bg-[#fff2] rounded-xl p-3 flex flex-row flex-center gap-3 m-4" ref={mainRef}>
        {stateMenus.map((menu, i) => {
            return <div key={i} className={`nav-menu ${homeState === menu ? 'active' : ''} ${isMatching ? 'disabled' : ''}`} onClick={e => {
                if(homeState === 'play' && isMatching) return
                dispatch({type:'homeState', value:menu})
            }}>
                {menu.toUpperCase()}
            </div>
        })}
    </nav>
}