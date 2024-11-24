import { createSlice } from "@reduxjs/toolkit";

export const folderIdSlice = createSlice({
    name: "folder",
    initialState: {
        folderId: 0, // 이 부분이 수정되었습니다.
    },
    reducers: {
        // login 성공 시
        SearchFolderId: (state, action) => {
            state.folderId = action.payload.folderId;
        }
    },
});

export const { SearchFolderId } = folderIdSlice.actions;
export default folderIdSlice.reducer;
