import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginInfo from '../../component/mypage/logininfo';
import smallImg from "../../resource/assets/mypage-small-logo.png"
import getUser from '../../utils/getUser';
import { NicknameUser as NicknameUserAction, ProfileUser as ProfileUserAction } from '../../reducer/userSlice';

export default function MyPageHeaderContainer() {
  const token = useSelector((state: any) => state.user.token);
  const nickname = useSelector((state: any) => state.user.nickname);
  const fireId = useSelector((state: any) => state.user.fireId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (!token) {
      navigate('/home');
    }
  }, [token, navigate]);

    useEffect(() => {
        handleUserInfo();
    }, []);


  
    const handleUserInfo = async () => {
        try {
            const response = await getUser(token);
            console.log(response,"결과뭐야");
            
            dispatch(NicknameUserAction({"nickname":response.nickname}));
            dispatch(ProfileUserAction({"fireId":response.fireId}));
            console.log(nickname,fireId,"닉ㅔ임!!!");
        } catch (error) {
            console.error("회원을 가져오지 못했습니다.", error);
        }
    };

  return (
    <MyPageWrapper>
      <MyPageSmallImg src={smallImg}/>
      <MyPageBigTitle>마이 페이지</MyPageBigTitle>
      <MyPageSmallTitle>My Page</MyPageSmallTitle>
      <LoginInfo/>
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  display: flex;
  padding: 0 22rem;
  gap:17px;
`;

const MyPageSmallImg = styled.img`
  width: 37px;
  height: 21px;


`
const MyPageBigTitle = styled.div`
  font-family: Inter;
font-size: 20px;
font-weight: 700;
line-height: 20px;
letter-spacing: 0px;
text-align: left;

`

const MyPageSmallTitle = styled.div`
font-family: Inter;
font-size: 20px;
font-weight: 700;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #7AA7E5;

`