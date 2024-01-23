import { Route, Routes,BrowserRouter } from "react-router-dom";

import Main from "./Page/Main/Main";


function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Main/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;