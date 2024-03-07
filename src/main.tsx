
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./reducer/userSlice.tsx";
import CommonStyle from './resource/style/CommonStyle.tsx';
import folderSlice from './reducer/folderSlice.tsx';

const store = configureStore({
    reducer: {
    user: userSlice,
    folder: folderSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <CommonStyle/>
      <App />
  </Provider>
)
