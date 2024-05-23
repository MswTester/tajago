

export default function Error(props:{
    message:string;
    animation:string;
}) {
    return (
        <div className={`absolute right-3 bottom-3 flex flex-col justify-center items-center p-4 rounded-lg shar2 select-none pointer-events-none bg-[#0006] ${props.animation}`}>
            <div className="text-red-600 font-semibold text-sm">{props.message}</div>
        </div>
    );
}