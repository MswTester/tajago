import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkNick, checkPass, sha256 } from "~/data/utils";


export default function Register(props:{setLpage:Dispatch<SetStateAction<string>>}) {
    const dispatch = useDispatch();
    const isFetching:boolean = useSelector((state:any) => state.isFetching)
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const mainRef = useRef<HTMLDivElement>(null)

    const register = async () => {
        if(password !== confirmPassword) return dispatch({type:'error', value:'Passwords do not match'})
        if(!checkNick(username)) return dispatch({type:'error', value:'Username must be 3-12 characters long and contain only letters, numbers'})
        if(!checkPass(password)) return dispatch({type:'error', value:'Password must be more than 6 characters long'})
        dispatch({type:'isFetching', value:true})
        const user:IUser = {
            username, password:sha256(password),
            id:Math.random().toString(36).substring(7),
            rating:1000,
            friends:[],
            pps:[],
            avc:[],
            acc:[],
            wins:0,
            losses:0,
            admin:false,
            banned:false
        }
        const res = await fetch('/controller/col/users/type/create', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(user)
        })
        const json = await res.json()
        dispatch({type:'isFetching', value:false})
        if(json.success){
            if(mainRef.current){
                mainRef.current.style.animation = 'fade-out 1s'
                setTimeout(() => {
                    dispatch({type:'user', value:user})
                    dispatch({type:'page', value:'home'})
                }, 950);
            }
        } else {
            dispatch({type:'error', value:'Username already exists'})
        }
    }

    const toLogin = () => {
        if(mainRef.current){
            mainRef.current.style.animation = 'fade-out 1s'
            setTimeout(() => {
                props.setLpage('login')
            }, 950);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full fade bar" ref={mainRef}>
            <div className="w-96 flex flex-col items-center justify-center gap-5">
                <h1 className="text-2xl text-center font-black-han-sans">Register</h1>
                    <div className="space-y-1 w-full">
                        <input disabled={isFetching} type="text" id="username" placeholder="Username" className="focus:outline-none rounded-lg p-2 w-full" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-1 w-full">
                        <input disabled={isFetching} type="password" id="password" placeholder="Password" className="focus:outline-none rounded-lg p-2 w-full" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-1 w-full">
                        <input disabled={isFetching} type="password" id="confirm-password" placeholder="Confirm Password" className="focus:outline-none rounded-lg p-2 w-full" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <button disabled={isFetching} className="w-full p-2 text-white rounded" onClick={e => {
                        register()
                    }}>Register</button>
                    <div className="flex flex-row gap-2 justify-center items-center w-full select-none">
                        <span className="font-roboto-mono text-sm">Already have an account?</span>
                        <span className="font-roboto-mono text-sm cursor-pointer underline" onClick={toLogin}>Login</span>
                    </div>
            </div>
        </div>
    );
}