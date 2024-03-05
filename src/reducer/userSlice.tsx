import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        email: "",
        token: "",
        nickname:""
    },
    reducers: {
        // login 성공 시
        loginUser: (state, action) => {
            state.email = action.payload.email;
            state.token = action.payload.token;
            state.nickname = action.payload.nickname;
            return state;
        },
        logoutUser: (state) => {
            state.email = "";
            state.token = "";
            state.nickname="";
        },
        NicknameUser:(state,action) => {
            state.nickname = action.payload.nickname;
            return state;
        }
    },
});

export const { loginUser, logoutUser ,NicknameUser } = userSlice.actions;
export default userSlice.reducer;

