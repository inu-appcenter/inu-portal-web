import { tokenUser as tokenUserAction } from '../reducer/userSlice';
import { Dispatch } from 'redux';

const refresh = async (dispatch: Dispatch) => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const apiURL = `https://portal.inuappcenter.kr/api/members/refresh`;
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'refresh': refreshToken
        }
      });

      if (response.status == 200) {
        const responseData = await response.json();
        const token = responseData['data'].accessToken;
        const tokenExpiredTime = responseData['data'].accessTokenExpiredTime;
        const refreshToken = responseData['data'].refreshToken;
        const refreshTokenExpiredTime = responseData['data'].refreshTokenExpiredTime;
        console.log('refresh 성공');

        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiredTime', tokenExpiredTime);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refreshTokenExpiredTime', refreshTokenExpiredTime);
        dispatch(tokenUserAction({token: token, tokenExpiredTime: tokenExpiredTime, refreshToken: refreshToken, refreshTokenExpiredTime: refreshTokenExpiredTime}));
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    catch (error) {
      console.log('refresh 실패, 모든 토큰 삭제');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiredTime');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('refreshTokenExpiredTime');
    }
  }
}

export default refresh;