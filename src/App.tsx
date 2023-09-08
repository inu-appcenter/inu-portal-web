import { Route, Routes, BrowserRouter } from 'react-router-dom';
import MainPage from './page/MainPage';
import HomePage from './page/HomePage';
import Login from './page/LoginPage';
import Register from './page/RegisterPage';
import Tips from './page/TipsPage';
import CreatePost from './page/CreatePostPage';
import PostDetail from "./page/PostDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />}>
          <Route index element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/tips' element={<Tips />} />
        </Route>

        <Route path='/write' element={<CreatePost />} />
        <Route path='/post:title' element={<PostDetail />} />

      </Routes>
    </BrowserRouter>
  );
}
