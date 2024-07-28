import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

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
    signInFail: (state) => {
      state.loading = false;
      state.error = true;
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
    deteleUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOutSuccess:(state)=>{
      state.currentUser = null;
      state.loading = false;
      state.error = false;
    }
  },
});
export const {
  signInStart,
  signInSuccess,
  signInFail,
  updateFailure,
  updateStart,
  updateSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deteleUserFailure,
  signOutSuccess
} = userSlice.actions;
// export userReducer to add in store
export default userSlice.reducer;
