import { loginUser as loginUserAction } from "../reducer/userSlice";
import { Dispatch } from 'redux';

interface LoginData {
  email: string,
  password: string
}

const loginUser = async (dispatch: Dispatch, data: LoginData): Promise<string | void> => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/members/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    console.log(response,'response');
    if (response.status == 400) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const token = response.text();
        console.log("로그인 성공", token);

        dispatch(loginUserAction({token:token}));

        return token; 
    }
    

  } catch (error) {
    console.log("에러?", error);
    alert("다시 입력해주세요.")
    throw error;
  }
};

export default loginUser;