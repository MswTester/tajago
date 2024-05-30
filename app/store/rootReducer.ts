const initialAppState = {
    page:'login',
    isFetching:false,
    error:'',
    alert:'',
    user:null,
    selectedUser:null,
    homeState:'play',
    isMatching:false,
    roomId:'',
    room:null,
    boxShadow:true,
    textShadow:true,
    backParticle:true,
    frontParticle:true,
    circle:true,
};
export const rootReducer = (
    state = initialAppState,
    action:storeAction
) => {
    return { ...state, [action.type]: action.value };
};
