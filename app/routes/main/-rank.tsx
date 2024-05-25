import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"


export default function RankState(props:socketProps){
    const socket = props.socket;
    const dispatch = useDispatch();
    const mainRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)
    const homeState = useSelector((state:any) => state.homeState)
    const isFetching = useSelector((state:any) => state.isFetching)

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'page-up 0.3s ease-in-out'
        }
    }, [once])

    useEffect(() => {
        if(homeState !== 'rank' && mainRef.current) mainRef.current.style.animation = 'page-down 0.3s ease-in-out'
    }, [homeState])

    return <div className="w-full h-full flex flex-col justify-center items-center pt-10 pb-5">
        <div className="w-[80%] h-full p-2 flex flex-col justify-center items-center gap-2 shar5 rounded-lg" ref={mainRef}>

        </div>
    </div>
}