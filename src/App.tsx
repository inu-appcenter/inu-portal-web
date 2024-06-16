// App.tsx - 애플리케이션의 루트 컴포넌트

import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainPage from './page/MainPage';
import HomePage from './page/HomePage';
import Login from './page/LoginPage/LoginPage';
import Tips from './page/TipsPage';
import MyPage from './page/MyPage';
import WritePost from './page/WritePostPage';
import AiPage from './page/AiPage';
import useUser from './hooks/useUser';
import useAuth from './hooks/useAuth';
import MobileMainPage from './mobile/pages/MobileMainPage';
// import MobileHomePage from './mobile/pages/MobileHomePage';

function App() {
  useUser();
  useAuth();

  return (
    <Routes>
      <Route path='/m' element={<MobileMainPage />}>
        {/* <Route path='/m/home' element={<MobileHomePage />} /> */}
      </Route>
      <Route path='/' element={<MainPage />}>
        <Route path='/' element={<HomePage />} />
        <Route path='/login/*' element={<Login />} />
        <Route path='/tips/*' element={<Tips />} />
        <Route path='/mypage/*' element={<MyPage />} />
      </Route>
      <Route path='/ai/*' element={<AiPage />} />
      <Route path='update/:id' element={<WritePost />} />
      <Route path='/write' element={<WritePost />} />
    </Routes>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
