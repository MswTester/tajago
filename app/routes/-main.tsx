import { useDispatch, useSelector } from "react-redux";
import Login from "./main/-login";
import Error from "./components/-error";
import { useEffect, useState } from "react";
import Home from "./main/-home";

export default function Main() {
    const dispatch = useDispatch();
    const page:string = useSelector((state:any) => state.page);
    const error:string = useSelector((state:any) => state.error);
    const [errorOff, setErrorOff] = useState<boolean>(false)
    const [curTimer, setCurTimer] = useState<NodeJS.Timeout|null>(null)

    useEffect(() => {
        if(error){
            let timer = setTimeout(() => {
                setErrorOff(true)
                setTimeout(() => {
                    dispatch({type:'error', value:''})
                    setErrorOff(false)
                }, 700);
            }, 2000);
            setCurTimer(timer)
        }
    }, [error])

    useEffect(() => {
        return () => {
            if(curTimer){
                clearTimeout(curTimer)
            }
        }
    }, [curTimer])

    return (<>{
        page === 'login' ? <Login /> :
        page === 'home' ? <Home /> :
        <div className="">Page not found</div>
    }
        {error && <Error message={error} animation={error ? errorOff ? "down" : "up" : ""} />}
    </>);
}
