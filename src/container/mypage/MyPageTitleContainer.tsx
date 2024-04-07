import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import getUser from '../../utils/getUser';
import { NicknameUser as NicknameUserAction , ProfileUser as ProfileuserAction} from '../../reducer/userSlice';
import { MypageTitle } from '../../component/mypage/common/MyPageTitle';
import MyPageUserInfo from '../../component/mypage/common/MyPageUserInfo';
import SearchBar from '../../component/Tips/SearchBar';

interface UserInfo {
  nickname: string;
  fireId: string;
}
interface loginInfo {
  user: {
    token: string;
  };
}

interface MyPageTitleContainerProps {
  selectedCategory:string;
}

export default function MyPageTitleContainer({selectedCategory}:MyPageTitleContainerProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

    useEffect(() => {
        handleUserInfo();
    }, []);


  
    const handleUserInfo = async () => {
        console.log('ttt', token);
        try {
            const response: UserInfo = await getUser(token);
            console.log(response,"결과뭐야");
            dispatch(NicknameUserAction({"nickname":response.nickname}));
            dispatch(ProfileuserAction({"fireId":response.fireId}));
        } catch (error) {
            console.error("회원을 가져오지 못했습니다.", error);
        }
    };

  return (
    <MyPageTitleWrapper>
      <MypageTitle/>
      <SearchInfoWrapper>
      {(selectedCategory ==='스크랩' || selectedCategory === "내 활동") && <SearchBar/>}
      <MyPageUserInfo/>
      </SearchInfoWrapper>
    </MyPageTitleWrapper>
  );
}

const MyPageTitleWrapper = styled.div`
    display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
`;

const SearchInfoWrapper = styled.div`
  display: flex;
  gap:20px;
`
