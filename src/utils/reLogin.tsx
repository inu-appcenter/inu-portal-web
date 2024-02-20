import { loginUser as loginUserAction } from "../reducer/userSlice";
import { Dispatch } from 'redux';

const reLogin = async (dispatch: Dispatch) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const apiURL = `https://portal.inuappcenter.kr/api/members`;
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Auth': token
        }
      });
  
      console.log(response);
      if (response.status == 200) {
        const responseData = await response.json();
        dispatch(loginUserAction({email: responseData.data.email, token:token}));
        console.log("reLogin 성공");
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    catch (error) {
      localStorage.removeItem('token');
      console.log("reLogin 에러?", error);
    }
  }
};

export default reLogin;