import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { checkNick, checkPass, sha256 } from "~/data/utils";


export default function SettingState(props:socketProps){
    const socket = props.socket;
    const dispatch = useDispatch();
    const mainRef = useRef<HTMLDivElement>(null)
    const [once, setOnce] = useState<boolean>(false)

    const boxShadow:boolean = useSelector((state:any) => state.boxShadow)
    const textShadow:boolean = useSelector((state:any) => state.textShadow)
    const frontParticle:boolean = useSelector((state:any) => state.frontParticle)
    const backParticle:boolean = useSelector((state:any) => state.backParticle)
    const circle:boolean = useSelector((state:any) => state.circle)

    const homeState = useSelector((state:any) => state.homeState)
    const isFetching = useSelector((state:any) => state.isFetching)
    const user = useSelector((state:any) => state.user)
    const [username, setUsername] = useState<string>(user.username)
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            if(mainRef.current) mainRef.current.style.animation = 'page-up 0.3s ease-in-out'
        }
    }, [once])

    useEffect(() => {
        if(homeState !== 'settings' && mainRef.current) mainRef.current.style.animation = 'page-down 0.3s ease-in-out'
    }, [homeState])

    const changeUsername = () => {
        if(username === user.username) return dispatch({type:'error', value:'Username is the same as before'})
        if(!checkNick(username)) return dispatch({type:'error', value:'Username must be 3-12 characters long and contain only letters, numbers'})
        dispatch({type:'isFetching', value:true})
        fetch('/controller/col/users/type/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({filter:{id:user.id}, update:{username}})
        }).then(res => res.json()).then(data => {
            dispatch({type:'isFetching', value:false})
            if(data.success){
                dispatch({type:'user', value:{...user, username}})
            } else {
                dispatch({type:'error', value:"Username already exists"})
            }
        })
    }

    const changePassword = () => {
        if(password !== confirmPassword) return dispatch({type:'error', value:'Passwords do not match'})
        if(!checkPass(password)) return dispatch({type:'error', value:'Password must be more than 6 characters long'})
        dispatch({type:'isFetching', value:true})
        fetch('/controller/col/users/type/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({filter:{id:user.id}, update:{password:sha256(password)}})
        }).then(res => res.json()).then(data => {
            dispatch({type:'isFetching', value:false})
            if(data.success){
                dispatch({type:'user', value:{...user, password:sha256(password)}})
                setPassword('')
                setConfirmPassword('')
            } else {
                dispatch({type:'error', value:"Password could not be changed"})
            }
        })
    }

    return <div className="w-full h-full flex flex-col justify-center items-center pt-10 pb-5 overflow-hidden">
        <div className="w-[80%] h-full p-2 flex flex-col justify-start items-center gap-2 shar5 rounded-lg overflow-y-auto overflow-x-hidden" ref={mainRef}>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <input disabled={isFetching} type="text" name="" id="" className="p-2 rounded-md" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <button disabled={isFetching} className="p-2 rounded-md" onClick={changeUsername}>Change Username</button>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <input disabled={isFetching} type="password" name="" id="" className="p-2 rounded-md" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <input disabled={isFetching} type="password" name="" id="" className="p-2 rounded-md" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <button disabled={isFetching} className="p-2 rounded-md" onClick={changePassword}>Change Password</button>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => dispatch({type:'boxShadow', value:!boxShadow})}>
                    {boxShadow && <div className="w-3 h-3 rounded-full bg-[#fff]" style={{boxShadow:'0 0 20px #fff'}}></div>}
                </div>
                <div>Box Shadow</div>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => dispatch({type:'textShadow', value:!textShadow})}>
                    {textShadow && <div className="w-3 h-3 rounded-full bg-[#fff]" style={{boxShadow:'0 0 20px #fff'}}></div>}
                </div>
                <div>Text Shadow</div>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => dispatch({type:'frontParticle', value:!frontParticle})}>
                    {frontParticle && <div className="w-3 h-3 rounded-full bg-[#fff]" style={{boxShadow:'0 0 20px #fff'}}></div>}
                </div>
                <div>Front Particle</div>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => dispatch({type:'backParticle', value:!backParticle})}>
                    {backParticle && <div className="w-3 h-3 rounded-full bg-[#fff]" style={{boxShadow:'0 0 20px #fff'}}></div>}
                </div>
                <div>Back Particle</div>
            </div>
            <div className="w-full flex flex-row justify-center gap-5 p-2 items-center">
                <div className="w-4 h-4 rounded-full sha flex justify-center items-center cursor-pointer" onClick={e => dispatch({type:'circle', value:!circle})}>
                    {circle && <div className="w-3 h-3 rounded-full bg-[#fff]" style={{boxShadow:'0 0 20px #fff'}}></div>}  
                </div>
                <div>Circle</div>
            </div>
        </div>
    </div>
}