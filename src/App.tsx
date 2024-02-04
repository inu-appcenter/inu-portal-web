import { Route, Routes, BrowserRouter  } from "react-router-dom";
import MainPage from "./page/MainPage";
import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
