import { Route, Routes, BrowserRouter,Navigate } from 'react-router-dom';
import MainPage from './page/MainPage';
import HomePage from './page/HomePage';
import Login from './page/LoginPage';
import Register from './page/RegisterPage';
import Tips from './page/TipsPage';
import CreatePost from './page/CreatePostPage';
import MyPage from './page/MyPage';
import { useEffect } from 'react';
import reLogin from './utils/reLogin';
import { useDispatch } from 'react-redux';


export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    reLogin(dispatch);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to={'home'} />} />
        <Route path='/' element={<MainPage />}>
          <Route path='/home' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/tips/*' element={<Tips />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/write' element={<CreatePost />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
