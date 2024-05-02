import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        studentId: "",
        token: "",
        tokenExpiredTime: "",
        refreshToken: "",
        refreshTokenExpiredTime: "",
        nickname:"",
        fireId:0
    },
    reducers: {
        // login 성공 시
        tokenUser: (state, action) => {
            state.token = action.payload.token;
            state.tokenExpiredTime = action.payload.tokenExpiredTime;
            state.refreshToken = action.payload.refreshToken;
            state.refreshTokenExpiredTime = action.payload.refreshTokenExpiredTime;
        },
        studentIdUser: (state, action) => {
            state.studentId = action.payload.studentId;
            return state;
        },
        logoutUser: (state) => {
            state.studentId = "";
            state.token = "";
            state.nickname = "";
            state.refreshToken = "";
        },
        NicknameUser:(state,action) => {
            state.nickname = action.payload.nickname;
            return state;
        },
        ProfileUser:(state,action) => {
            state.fireId = action.payload.fireId;
            return state;
        }
    },
});

export const { tokenUser, studentIdUser, logoutUser ,NicknameUser,ProfileUser } = userSlice.actions;
export default userSlice.reducer;

