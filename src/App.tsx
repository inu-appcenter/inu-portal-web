import { Route, Routes, BrowserRouter,Navigate } from 'react-router-dom';
import MainPage from './page/MainPage';
import HomePage from './page/HomePage';
import Login from './Page/LoginPage/LoginPage';
import Tips from './page/TipsPage';
import MyPage from './page/MyPage';
import { useEffect } from 'react';
import reLogin from './utils/reLogin';
import { useDispatch } from 'react-redux';
import refresh from './utils/refresh';



export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    reLogin(dispatch);
  
    // Function to check token expiration and refresh if necessary
    const checkAndRefreshToken = async () => {
      const tokenExpiredTime = localStorage.getItem('tokenExpiredTime');
      console.log(`checkAndRefreshToken:\ntokenExpiredTime=${tokenExpiredTime}`);
      if (tokenExpiredTime) {
        const now = new Date();
        console.log(`checkAndRefreshToken:\nnow=${now}`);
        const expirationTime = new Date(tokenExpiredTime);
        console.log(`checkAndRefreshToken:\nexpirationTime=${expirationTime}`);
        const timeLeft = expirationTime.getTime() - now.getTime();
        const minutesLeft = timeLeft / (1000 * 60);
        console.log(`checkAndRefreshToken:\nminutesLeft=${minutesLeft}`);
  
        // If less than or equal to 30 minutes left, refresh the token
        if (minutesLeft <= 30) {
          console.log("Token is about to expire, refreshing...");
          await refresh(dispatch);
        }
      }
    };
  
    // Call immediately in case the page is reloaded and the token is about to expire
    checkAndRefreshToken();
  
    // Set up interval to check token expiration every 15 minutes
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 15 * 60 * 1000); // 15 minutes (단위 ms)
  
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to={'home'} />} />
        <Route path='/' element={<MainPage />}>
          <Route path='/home' element={<HomePage />} />
          <Route path='/login/*' element={<Login />} />
          <Route path='/tips/*' element={<Tips />} />
          <Route path='/mypage/*' element={<MyPage />} />

          
        </Route>

      </Routes>
    </BrowserRouter>
  );
}