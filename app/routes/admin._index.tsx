import { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { checkNick, checkPass, sha256 } from "~/data/utils";

export const meta: MetaFunction = () => {
    return [
        { title: "Tajago Admin" },
        { name: "description", content: "Admin Page" },
    ];
};

type Collection = {[key:string]:{[key:string]:any}[]}

const collections:{[key:string]:string} = {
    "users":"username"
}

export default function Admin() {
    const [user, setUser] = useState<IUser|null>(null)
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const Login = async () => {
        if(!checkNick(username)) return setError('Invalid Username')
        if(!checkPass(password)) return setError('Invalid Password')
        setIsFetching(true)
        const res = await fetch('/controller/col/users/type/get', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username, password:sha256(password)})
        })
        const json:IUser = await res.json()
        setIsFetching(false)
        if(json.username){
            setUser(json)
        } else {
            setError('Invalid Username or Password')
        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            {user?.admin ? <Table />:
            <div className="flex flex-col justify-center items-center gap-3 w-48">
                <input disabled={isFetching} className="p-2 rounded-md w-full" type="text" name="" id="" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}/>
                <input disabled={isFetching} className="p-2 rounded-md w-full" type="password" name="" id="" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
                <button disabled={isFetching} className="p-2 rounded-md w-full" onClick={Login}>Login</button>
                <div className="w-full text-center text-red-500">{error}</div>
            </div>
            }
        </div>
    );
}

function Table (){
    const [once, setOnce] = useState<boolean>(false)
    const [res, setRes] = useState<Collection>({})
    const [selected, setSelected] = useState<number>(0)
    const [ta, setTa] = useState<string>('')
    const [onTa, setOnTa] = useState<string>("")
    const [target, setTarget] = useState<string>("")
    const [isFetching, setIsFetching] = useState<boolean>(false)

    const refresh = () => {
        setIsFetching(true)
        const res = fetch('/getAll', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(Object.keys(collections))
        })
        res.then(res => res.json()).then((json:Collection) => {
            setRes(json)
            setSelected(0)
            setIsFetching(false)
        })
    }

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(once){
            refresh()
        }
    }, [once])

    const closeTa = () => {
        setTa("")
        setOnTa("")
        setTarget("")
    }

    return (
        <div className="w-full h-full flex flex-row justify-start items-center gap-3 overflow-hidden">
            <div className="flex flex-col justify-start items-center gap-2 p-2">
                {Object.keys(res).map((key, i) => {
                    return <button key={i} disabled={isFetching} className={`p-2 w-full rounded-md cursor-pointer ${selected === i ? 'bg-neutral-600' : 'bg-neutral-800'}`} onClick={e => setSelected(i)}>{key}</button>
                })}
            </div>
            <div className="flex-1 h-full flex flex-col justify-center items-center overflow-hidden p-2 gap-2">
                <div className="w-full flex flex-row justify-center items-center gap-2">
                    <button disabled={isFetching} className="flex-1 p-2 rounded-md" onClick={refresh}>Refresh</button>
                    <button disabled={isFetching} className="flex-1 p-2 rounded-md" onClick={e => {
                        setTa(JSON.stringify({}, null, 2))
                        setOnTa("create")
                        setTarget("")
                    }}>Create</button>
                    <button disabled={isFetching} className="flex-1 p-2 rounded-md" onClick={e => {
                        setTa(JSON.stringify({}, null, 2))
                        setOnTa("modify")
                        setTarget("")
                    }}>Modify</button>
                    <button disabled={isFetching} className="flex-1 p-2 rounded-md" onClick={e => {
                        setTa(JSON.stringify([], null, 2))
                        setOnTa("delkeys")
                        setTarget("")
                    }}>Delete Keys</button>
                </div>
                <div className="w-full h-full flex flex-col justify-start items-center gap-2 overflow-y-auto overflow-x-hidden">
                    {Object.values(res)[selected] ? Object.values(res)[selected].map((items, i) => {
                        const col = Object.keys(res)[selected]
                        const id = collections[col]
                        return <details key={i} className="bg-neutral-800 p-2 rounded-md cursor-pointer w-full">
                            <summary className="flex flex-row justify-between items-center">
                                <div className="text-lg font-bold">{items[id]}</div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <button disabled={isFetching} className="p-2 rounded-md" onClick={e => {
                                        let obj = {...items}
                                        delete obj["_id"]
                                        setTa(JSON.stringify(obj, null, 2))
                                        setTarget(items["_id"])
                                        setOnTa("edit")
                                    }}>Edit</button>
                                    <button disabled={isFetching} className="p-2 rounded-md" onClick={e => {
                                        setIsFetching(true)
                                        fetch(`/controller/col/${col}/type/delete`, {
                                            method:'POST',
                                            headers:{'Content-Type':'application/json'},
                                            body:JSON.stringify({_id:items["_id"]})
                                        }).then(res => res.json()).then((json) => {
                                            refresh()
                                        })
                                    }}>Delete</button>
                                </div>
                            </summary>
                            {Object.keys(items).map((item:any, j:number) => {
                                return <div key={j} className="flex flex-row justify-between items-center">
                                    "{item}" : {JSON.stringify(items[item], null, 2)}
                                </div>
                            })}
                        </details>
                    }) : null}
                </div>
            </div>
            {onTa && <div className="absolute top-0 left-0 bg-[#0004] w-full h-full flex flex-col justify-center items-center" onMouseDown={e => {
                if(e.target === e.currentTarget) closeTa()
            }}>
                <div className="bg-[#fff9] p-2 rounded-md w-[80%] h-[80%] flex flex-col justify-center items-center gap-2">
                    <textarea disabled={isFetching} className="w-full h-full p-2 rounded-md" value={ta} onChange={e => setTa(e.target.value)}></textarea>
                    <button disabled={isFetching} className="p-2 rounded-md w-full" onClick={e => {
                        setIsFetching(true)
                        if(onTa === "create"){
                            fetch(`/controller/col/${Object.keys(res)[selected]}/type/create`, {
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:ta
                            }).then(res => res.json()).then((json) => {
                                closeTa()
                                refresh()
                            })
                        } else if(onTa === 'modify') {
                            fetch(`/controller/col/${Object.keys(res)[selected]}/type/updateAll`, {
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:ta
                            }).then(res => res.json()).then((json) => {
                                closeTa()
                                refresh()
                            })
                        } else if(onTa === 'delkeys') {
                            fetch(`/controller/col/${Object.keys(res)[selected]}/type/deleteKeys`, {
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:ta
                            }).then(res => res.json()).then((json) => {
                                closeTa()
                                refresh()
                            })
                        
                        } else if(onTa === "edit") {
                            fetch(`/controller/col/${Object.keys(res)[selected]}/type/update`, {
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({filter:{_id:target}, update:JSON.parse(ta)})
                            }).then(res => res.json()).then((json) => {
                                closeTa()
                                refresh()
                            })
                        }
                    }}>{onTa.toUpperCase()}</button>
                </div>
            </div>}
        </div>
    )
}