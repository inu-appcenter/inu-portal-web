import { Route, Routes,BrowserRouter  } from "react-router-dom";
import MainPage from "./page/MainPage";
import HomePage from "./page/HomePage";

export default function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* <Route path="/" element={<Navigate to={'/home'}/>} /> */}
        <Route path="/" element={<MainPage/>} >
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

