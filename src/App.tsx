
import { Route, Routes,BrowserRouter } from "react-router-dom";

import Tips from './page/Tips/Tips';
import Login from './page/Login/Login';
import MainTips from './page/MainTips/MainTips';
import Main from "./page/Main/Main";

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/tips" element={<Tips/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/MainTips" element={<MainTips/>} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;