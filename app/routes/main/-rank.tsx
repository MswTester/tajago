import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"


export default function RankState(props:socketProps){
    const socket = props.socket;
    const dispatch = useDispatch();
    const mainRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)
    const homeState = useSelector((state:any) => state.homeState)
    const isFetching = useSelector((state:any) => state.isFetching)
    const [rankPlayers, setRankPlayers] = useState<IUser[]>([])
    const [scrollHeight, setScrollHeight] = useState<number>(0)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'page-up 0.3s ease-in-out'
            fetch('/getUsers/start/0/len/50', {method:'GET'}).then(res => res.json()).then(data => {
                setRankPlayers(data)
            })
        }
    }, [once])

    useEffect(() => {
        if(homeState !== 'rank' && mainRef.current) mainRef.current.style.animation = 'page-down 0.3s ease-in-out'
    }, [homeState])

    useEffect(() => {
        console.log(scrollHeight)
    }, [scrollHeight])

    return <div className="w-full h-full flex flex-col justify-center items-center pt-10 pb-5 overflow-hidden">
        <div className="w-[80%] h-full p-2 flex flex-col justify-center items-center gap-2 shar5 rounded-lg overflow-x-hidden overflow-y-auto" ref={mainRef} onScroll={e => {
            const element = e.target as HTMLDivElement
            setScrollHeight(element.scrollHeight - element.clientHeight)
        }}>
            {rankPlayers.map((player, index) => {
                return <div key={index} className="w-full flex justify-between items-center p-2 shar4 rounded-lg">
                    <div className="flex justify-center items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <div className="text-md lg:text-lg font-semibold">{index+1}. {player.username}</div>
                    </div>
                    <div className="text-md lg:text-lg">{player.rating} R</div>
                </div>
            })}
        </div>
    </div>
}