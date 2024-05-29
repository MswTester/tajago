import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkNick, sha256 } from "~/data/utils";
import Register from "./-register";
// import { isDev } from "../-main";
const isDev = false

export default function Login() {
    const dispatch = useDispatch()
    const isFetching:boolean = useSelector((state:any) => state.isFetching)
    const [once, setOnce] = useState<boolean>(false)
    const [lpage, setLpage] = useState<string>('start')
    const [username, setUsername] = useState<string>('')
    const [cursor, setCursor] = useState<[number, number]>([0, 0])
    const [onPass, setOnPass] = useState<boolean>(false)
    const [password, setPassword] = useState<string>('')
    const downRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)
    const backRef = useRef<HTMLDivElement>(null)
    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const handleMouseMove = (e: MouseEvent) => {
        setCursor([e.clientX, e.clientY])
    }

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if (once) {
            setTimeout(() => {
                setLpage('login')
            }, (isDev ? 10 : 3200));

            if(isDev) TryLogin('maestro', 'maestro')

            document.addEventListener('mousemove', handleMouseMove)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
            }
        }
    }, [once])

    const toRegister = () => {
        if(downRef.current) downRef.current.style.animation = 'inp-down 1s ease-in-out'
        if(mainRef.current) mainRef.current.style.animation = 'main-down 1s ease-in-out'
        if(backRef.current) backRef.current.style.animation = 'fade-out 1s ease-in-out'
        setTimeout(() => {
            setLpage('register')
        }, 950);
    }

    useEffect(() => {
        if(lpage === 'login'){
            if(downRef.current) downRef.current.style.animation = 'inp-up 1s ease-in-out'
            if(mainRef.current) mainRef.current.style.animation = 'main-up 1s ease-in-out'
            if(backRef.current) backRef.current.style.animation = 'fade 1s ease-in-out'
        }
    }, [lpage])

    const EnterUsername = async () => {
        if(checkNick(username)){
            dispatch({type:'isFetching', value:true})
            const res = await fetch('/controller/col/users/type/get', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({username})
            })
            const json = await res.json()
            dispatch({type:'isFetching', value:false})
            if(json.username){
                setOnPass(true)
                setPassword("")
                passwordRef.current?.focus()
            } else {
                dispatch({type:'error', value:'Invalid username'});
            }
        } else {
            dispatch({type:'error', value:'Username must be 3-12 characters long and contain only letters, numbers'});
        }
    }

    const TryLogin = async (username:string, password:string) => {
        dispatch({type:'isFetching', value:true})
        const res = await fetch('/controller/col/users/type/get', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username, password:sha256(password)})
        })
        const json = await res.json()
        dispatch({type:'isFetching', value:false})
        if(json.username){
            if(downRef.current) downRef.current.style.animation = 'inp-down 1s ease-in-out'
            if(mainRef.current) mainRef.current.style.animation = 'main-down 1s ease-in-out'
            if(backRef.current) backRef.current.style.animation = 'fade-out 1s ease-in-out'
            setTimeout(() => {
                successLogin(json)
            }, 950);
        } else {
            dispatch({type:'error', value:'Invalid password'});
        }
    }

    const successLogin = (json:IUser) => {
        dispatch({type:'user', value:json})
        dispatch({type:'page', value:'home'})
    }

    return (
        lpage === 'start' ? <div className="l1 flex flex-col gap-10 justify-center items-center">
            <img width={300} height={300} src="/icon.png" alt="" />
            <div className="w-96 flex justify-center items-center select-none sweep">Tajago</div>
        </div> :
        lpage === 'login' ? <div className={`w-full h-full flex flex-col justify-between items-center p-6`} ref={backRef}>
            <div className="back fade l2"></div>
            <div className="fixed top-0 left-0 w-full h-full fade pointer-events-none">
                <div className="shar fixed" style={{left:`${cursor[0]}px`, top:`${cursor[1]}px`}}></div>
            </div>
            <div className="fade font-major-mono-display">MSWTESTER REPRESENT</div>
            <div className="flex justify-center items-center select-none sweep rounded-full w-96 h-96 main pt-36" ref={mainRef}>Tajago</div>
            <div className="flex flex-col justify-center items-center gap-3 up" ref={downRef}>
                {!onPass ?
                <input ref={usernameRef} disabled={isFetching} className="w-96 p-2 login-input bg-[#000] focus:outline-none rounded-lg" type="text" placeholder="Username"
                value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={async e => {
                    if (e.key === 'Enter') {
                        EnterUsername()
                    }
                }} /> :
                <input ref={passwordRef} disabled={isFetching} className="w-96 p-2 login-input bg-[#000] focus:outline-none rounded-lg" type="password" placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={async e => {
                    if (e.key === 'Enter') {
                        if(onPass){
                            TryLogin(username, password)
                        } else {
                            dispatch({type:'error', value:'Enter username first'});
                        }
                    }
                }} /> }
                <div className="text-sm font-mono cursor-pointer select-none underline" onClick={e => {
                    if(onPass) {
                        setOnPass(false)
                        setUsername("")
                        usernameRef.current?.focus()
                    }
                    else {
                        setUsername("")
                        toRegister()
                    }
                }}>{onPass ? "Back" : "To Register"}</div>
            </div>
        </div> : 
        lpage === "register" ? <Register setLpage={setLpage} /> :
        null
    );
}