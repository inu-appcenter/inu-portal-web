// useAuth.ts - 토큰 갱신 로직을 처리하는 훅

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refresh, getMembers } from '../utils/API/Members';
import { tokenUser as tokenUserAction, studentIdUser as studentIdUserAction } from "../reducer/userSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  // 로그인 갱신 함수
  const reLogin = async (dispatch: any) => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const { status, body } = await refresh(refreshToken);
        if (status === 200) {
          const token = body['data'].accessToken;
          const tokenExpiredTime = body['data'].accessTokenExpiredTime;
          const newRefreshToken = body['data'].refreshToken;
          const refreshTokenExpiredTime = body['data'].refreshTokenExpiredTime;

          console.log('refresh 성공');

          localStorage.setItem('token', token);
          localStorage.setItem('tokenExpiredTime', tokenExpiredTime);
          localStorage.setItem('refreshToken', newRefreshToken);
          localStorage.setItem('refreshTokenExpiredTime', refreshTokenExpiredTime);

          dispatch(tokenUserAction({ token, tokenExpiredTime, refreshToken: newRefreshToken, refreshTokenExpiredTime }));
        } else {
          throw new Error(`HTTP error! Status: ${status}`);
        }
      } catch (error) {
        console.log('refresh 실패, 모든 토큰 삭제');
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiredTime');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiredTime');
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { status, body } = await getMembers(token);
        if (status === 200) {
          dispatch(studentIdUserAction({ studentId: body.data.studentId }));
          console.log('reLogin 성공');
        } else {
          throw new Error(`HTTP error! Status: ${status}`);
        }
      } catch (error) {
        console.log('reLogin 에러', error);
      }
    }
  };

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
          console.log('Token is about to expire, refreshing...');
          await reLogin(dispatch);
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
};

export default useAuth;
