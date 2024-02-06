import { Route, Routes, BrowserRouter } from "react-router-dom";
import MainPage from "./page/MainPage";
import HomePage from "./page/HomePage";
import Login from "./page/LoginPage";
import Register from "./page/RegisterPage";
import Tips from "./Page/TipsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          {/* 이 부분에서 /home과 /login을 /의 하위에 위치시킴 */}
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tips" element={<Tips/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
