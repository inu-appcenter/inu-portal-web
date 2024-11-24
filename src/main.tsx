import ReactDOM from "react-dom/client";
import App from "App";
// import { Provider } from "react-redux";
// import { configureStore } from "@reduxjs/toolkit";
// import userSlice from "./reducer/userSlice";
import CommonStyles from "resources/styles/CommonStyles";
// import folderSlice from "./reducer/folderSlice";
// import folderIdSlice from "./reducer/folderId";

// const store = configureStore({
//   reducer: {
//     user: userSlice,
//     folder: folderSlice,
//     folderId: folderIdSlice,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <Provider store={store}>
  <>
    <CommonStyles />
    <App />
  </>
  // </Provider>
);
