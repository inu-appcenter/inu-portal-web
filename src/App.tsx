import { Route, Routes, BrowserRouter,Navigate } from 'react-router-dom';
import MainPage from './page/MainPage';
import HomePage from './page/HomePage';
import Login from './page/LoginPage';
import Register from './page/RegisterPage';
import Tips from './page/TipsPage';
import CreatePost from './page/CreatePostPage';
import PostDetail from "./page/PostDetailPage";
import MyPage from './page/MyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to={'home'} />} />
        <Route path='/' element={<MainPage />}>
          <Route path='/home' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/tips' element={<Tips />} />
          <Route path='/post/:id' element={<PostDetail />} />
          <Route path='/mypage' element={<MyPage />} />
          <Route path='/write' element={<CreatePost />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
