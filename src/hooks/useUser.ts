// useUser.ts - 사용자 정보를 처리하는 훅

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { NicknameUser as NicknameUserAction, ProfileUser as ProfileuserAction } from '../reducer/userSlice';
import getUser from '../utils/getUser';

interface UserInfo {
  nickname: string;
  fireId: string;
}

interface loginInfo {
  user: {
    token: string;
  };
}

const useUser = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: loginInfo) => state.user.token);

  const handleUserInfo = useCallback(async () => {
    if (token) {
      try {
        const response: UserInfo = await getUser(token);
        console.log(response, "결과뭐야");
        dispatch(NicknameUserAction({ "nickname": response.nickname }));
        dispatch(ProfileuserAction({ "fireId": response.fireId }));
      } catch (error) {
        console.error("회원을 가져오지 못했습니다.", error);
      }
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (token) {
      handleUserInfo();
    }
  }, [token, handleUserInfo]);
};

export default useUser;
