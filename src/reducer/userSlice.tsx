import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        token: "",
    },
    reducers: {
        // login 성공 시
        loginUser: (state, action) => {
            state.token = action.payload.token;
            return state;
        },
    },
});

export const { loginUser } = userSlice.actions;
export default userSlice.reducer;

