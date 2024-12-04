import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: false,
  loading: false,
};
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    signInSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
    },
    signInFail: (state,action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetError:(state)=>{
      state.error=null;
    },
    updateStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = false;
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = false;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOutStart:(state)=>{
      state.loading=true;
      state.error=false;
    },
    signOutSuccess:(state)=>{
      state.currentUser = null;
      state.loading = false;
      state.error = false;
    },
    signOutFailure:(state,action)=>{
      state.loading=false;
      state.error=action.payload;
    }
  },
});
export const {
  signInStart,
  signInSuccess,
  signInFail,
  resetError,
  updateFailure,
  updateStart,
  updateSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure
} = userSlice.actions;
// export userReducer to add in store
export default userSlice.reducer;
