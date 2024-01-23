import './App.css'
import MainWindow from './MainWindow'
import { Route, Routes,BrowserRouter } from "react-router-dom";
import Main from './Page/Main/Main';
function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Main/>} />
        <Route path="/tip" element={<MainWindow/>} />
      </Routes>
    </BrowserRouter>
  );

}

export default App;