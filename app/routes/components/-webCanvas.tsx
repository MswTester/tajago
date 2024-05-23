import Obj from "~/data/obj";

export default function WebCanvas(props:{
    idx:number;
    objs:Obj[];
    style?:React.CSSProperties;
    bg?:string;
    focus?:boolean;
}) {
    return (
        <div className={props.focus ? "" : "pointer-events-none"}
        style={{...props.style, zIndex:`${props.idx}`, background: props.bg || "",
        width:'100vw', height:'100vh', position:'absolute', left:'0px', top:'0px'}}>
            {props.objs.map((obj, i) => {
                return <div key={i} className="absolute" style={obj.getStyle()}></div>
            })}
        </div>
    );
}