import { studentIdUser as studentIdUserAction } from "../reducer/userSlice";
import { Dispatch } from 'redux';
import refresh from "./refresh";

const reLogin = async (dispatch: Dispatch) => {
  await refresh(dispatch);
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
        dispatch(studentIdUserAction({studentId: responseData.data.studentId}));
        console.log("reLogin 성공");
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    catch (error) {
      console.log("reLogin 에러", error);
    }
  }
};

export default reLogin;