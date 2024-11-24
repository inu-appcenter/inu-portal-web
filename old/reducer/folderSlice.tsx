
import { createSlice,  } from '@reduxjs/toolkit';
interface State {
    folders: { [key: number]: string };
}

const initialState:State = {
    folders: { 0: "내 폴더" },
};

export const folderSlice = createSlice({
    name: 'folder',
    initialState,
    reducers: {
        addFolder: (state, action) => {
            state.folders = {
                ...state.folders,
                ...action.payload
            };
        },
        removeFolder: (state, action) => {
            const updatedFolders = { ...state.folders };
            const folderIdToDelete = Number(Object.keys(action.payload)[0]); // Extracting the folder ID
            delete updatedFolders[folderIdToDelete];
            state.folders = updatedFolders;
        }
        
       
    },
});

export const { addFolder,removeFolder} = folderSlice.actions;
export default folderSlice.reducer;