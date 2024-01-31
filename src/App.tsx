
import { Route, Routes,BrowserRouter } from "react-router-dom";
import Main from './Page/Main/Main';
import Tips from './Page/Tips/Tips';
import Login from './Page/Login/Login';
import MainTips from './Page/MainTips/MainTips';

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