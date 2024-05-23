const initialAppState = {
    page:'login',
    isFetching:false,
    error:'',
    user:null,
    selectedUser:null,
};
export const rootReducer = (
    state = initialAppState,
    action:storeAction
) => {
    return { ...state, [action.type]: action.value };
};