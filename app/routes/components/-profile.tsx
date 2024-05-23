import { useDispatch, useSelector } from "react-redux";


export default function Profile() {
    const dispatch = useDispatch();
    const selectedUser:IUser = useSelector((state:any) => state.selectedUser);
    const isFetching:boolean = useSelector((state:any) => state.isFetching);
    return (
        <div className="w-full h-full absolute top-0 left-0 bg-[#0005]"
        onMouseDown={e => {
            if(e.target === e.currentTarget){
                dispatch({type:'selectedUser', value:null})
            }
        }}>
            {isFetching ? <div className="text-3xl font-bold font-black-ops-one">Fetching . . .</div>:
            selectedUser && <div className="w-96 h-96 bg-[#0008] rounded-lg flex flex-col items-center justify-center gap-5">
                <h1 className="text-2xl text-center font-black-han-sans">{selectedUser.username}</h1>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-lg">Rating: {selectedUser.rating}</h1>
                    <h1 className="text-lg">Wins: {selectedUser.wins}</h1>
                    <h1 className="text-lg">Losses: {selectedUser.losses}</h1>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-lg">PPS: {selectedUser.pps.length}</h1>
                    <h1 className="text-lg">AVC: {selectedUser.avc.length}</h1>
                    <h1 className="text-lg">ACC: {selectedUser.acc.length}</h1>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-lg">Friends: {selectedUser.friends.length}</h1>
                </div>
            </div>}
        </div>
    );
}