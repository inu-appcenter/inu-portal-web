import './App.css'
import { Route, Routes,BrowserRouter } from "react-router-dom";
import Main from './Page/Main/Main';
import Tips from './Page/Tips/Tips';
import Login from './Page/Login/Login';

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/tips" element={<Tips/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;