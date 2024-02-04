import { Route, Routes, BrowserRouter  } from "react-router-dom";
import MainPage from "./page/MainPage";
import HomePage from "./page/HomePage";
import Login from "./page/LoginPage";
import Register from "./page/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
