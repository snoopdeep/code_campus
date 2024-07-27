import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light",
};
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

// export the theme slice to add in store
export const {toggleTheme}= themeSlice.actions;
// export the reducers to use in ui
export default themeSlice.reducer;