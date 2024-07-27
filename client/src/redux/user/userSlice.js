import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentUser:null,
    error:false,
    loading:false,
}
export const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        signInStart:(state)=>{
            state.loading=true;
            state.error=false;
        },
        signInSuccess:(state,action)=>{
            state.loading=false;
            state.currentUser=action.payload;
        },
        signInFail:(state)=>{
            state.loading=false;
            state.error=true;
        },
    }
})
export const {signInStart,signInSuccess,signInFail}=userSlice.actions;
// export userReducer to add in store
export default userSlice.reducer;