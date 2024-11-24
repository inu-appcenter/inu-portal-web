// useUser.ts - 사용자 정보를 처리하는 훅

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { NicknameUser as NicknameUserAction, ProfileUser as ProfileuserAction } from '../reducer/userSlice';
import { getMembers } from '../utils/API/Members';

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
        const response = await getMembers(token);
        if (response.status === 200) {
          const userInfo: UserInfo = response.body.data;
          dispatch(NicknameUserAction({ "nickname": userInfo.nickname }));
          dispatch(ProfileuserAction({ "fireId": userInfo.fireId }));
        } else if (response.status === 404) {
          console.error('존재하지 않는 회원입니다.');
        } else {
          console.error('회원 정보 가져오기 실패:', response.status);
        }
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
