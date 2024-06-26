import { useSelector } from "react-redux";
import Obj from "~/data/obj";

export default function WebCanvas(props:{
    idx:number;
    objs:Obj[];
    style?:React.CSSProperties;
    bg?:string;
    focus?:boolean;
    ref?:React.RefObject<HTMLDivElement>;
}) {
    const boxShadow:boolean = useSelector((state:any) => state.boxShadow)
    return (
        <div className={props.focus ? "" : "pointer-events-none"} ref={props.ref}
        style={{...props.style, zIndex:`${props.idx}`, background: props.bg || "",
        width:'100vw', height:'100vh', position:'absolute', left:'0px', top:'0px'}}>
            {props.objs.map((obj, i) => {
                return <div key={i} className="absolute flex flex-col justify-center items-center text-center" style={obj.getStyle(boxShadow)}>{obj.text}</div>
            })}
        </div>
    );
}