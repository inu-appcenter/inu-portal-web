import { Route, Routes, BrowserRouter  } from "react-router-dom";
import MainPage from "./Page/MainPage";
import HomePage from "./Page/HomePage";
import LoginPage from "./Page/LoginPage";

export default function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* <Route path="/" element={<Navigate to={'/home'}/>} /> */}
        <Route path="/" element={<MainPage/>} >
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

