import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getMembers } from '../../utils/API/Members';
import { useEffect, useState } from 'react';

import { MyPageActive,MyPageCategory } from '../../resource/string/m-mypage';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../reducer/userSlice';
import UserInfo from '../containers/mypage/UserInfo';
import arrowImg from '../../resource/assets/mobile/mypage/arrow.svg';


interface loginInfo {
    user: {
      token: string;
    };
}


interface userInfo {
    id:number;
    nickname:string;
    fireId:number
}
  
export default function MobileMyPage() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [user,setUser] = useState<userInfo|null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getMember = async () => {
        try {
          const response = await getMembers(token);
          if (response.status === 200) {
            setUser(response.body.data);
          }
        } catch (error) {
          console.error('error');
        }
      };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        dispatch(logoutUser());
        navigate('/m/home');
    };
    const handleLogoutModalClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleClick = (title:string) => {
        switch (title) {
            case '내가 쓴 글':
                navigate('m/mypage/post')
                break;
            case '좋아요 한 글':
                navigate('m/mypage/like')
                break;
            case '작성한 댓글':
                navigate('m/mypage/comment')
                break;
            case '프로필 편집':
                navigate('/m/mypage/profile')
                break;
            case '스크랩':
                navigate('/m/save');
            break;
            case '로그아웃':
                handleLogoutModalClick();
            break;
            case '회원탈퇴':
                navigate('/m/mypage/delete');
            break;

            default:
                break;
        }
    }
      useEffect(() => {
        if (token) {
            getMember();
        }
      }, [token]);

  return (
    <>
          {token ? (
             <MyPageWrapper>
                <UserWrapper>
                {user && <UserInfo/>}
                </UserWrapper>
               
                <ActiveWrapper>
                    {MyPageActive.map((active,index)=> (
                        <div key={index} onClick={()=>handleClick(active.title)}>
                                            <img src={active.image}/>
                            <p>{active.title}</p>
                            </div>
                    ))}
                </ActiveWrapper>
                <CategoryWrapper>
                    {MyPageCategory.map((category,index)=> (
                        <div key={index} onClick={()=>handleClick(category.title)}>
                            <span>
                                <img src={category.image}/>
                                <p>{category.title}</p>
                            </span>
                            <Arrow src={arrowImg} />
                        </div>
                    ))}
                </CategoryWrapper>
                {isModalOpen && (
                        <ModalOverlay>
                            <ModalContent>
                                <Title>INTIP에서 <br />
                                    로그아웃 하시겠어요?</Title>
                                <ButtonContainer>
                                    <CancelButton onClick={handleModalClose}>취소</CancelButton>
                                    <Divider />
                                    <LogoutButton onClick={handleLogout}>확인</LogoutButton>
                                </ButtonContainer>
                            </ModalContent>
                        </ModalOverlay>
                    )}
            </MyPageWrapper>
            
      ) : (
        <div>로그인이 필요합니다.</div>
      )}
      </>
  )
}



const MyPageWrapper = styled.div`
background: #F3F7FE;
width: 100%;
display: flex;
justify-content: center;
`;

const UserWrapper = styled.div`
    position: absolute;
    top:0;
    width:100%;
    height: 35%;
    background: #A1C3FF;
    z-index:10;
    display: flex;
    justify-content: center;
`

const ActiveWrapper = styled.div`
box-sizing: border-box;
     background-color: #fff;
     position: absolute;
     padding:27px 38px;
     padding-bottom: 11px;
     top:28%;
    display: flex;
    z-index: 15;
    gap:30px;
    border-radius:10px;
    div {
        display:flex;
        flex-direction: column;
    align-items: center;
    justify-content: center;
    }
`

const CategoryWrapper = styled.div`
    position: absolute;
    top:46%;
    display: flex;
    z-index: 15;
    /* row-gap:30px; */
    border-radius:10px;
    flex-direction: column;
    width: 80%;
    gap: 16px;
    div {
        width: calc(100% - 32px);
        display:flex;
        align-items: center;
        justify-content: space-between;
        background-color: #fff;
        padding: 10px 16px 10px 16px;
        border-radius:10px;
        span {
            display: flex;
            align-items: center;
            gap: 18px;
            img {
                width:36px;
                height:36px;
            }
        }
    }
`

const Arrow = styled.img`
    width: 8px;
`

const ModalOverlay = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    width: 300px;
    max-width: 90%;
    padding-top: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    
`;

const Title = styled.div`
    font-size: 16px;
    font-weight: bold;

    text-align: center;
    height: 70px;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: space-evenly;
    height:50px;
border-top: 1px solid #D9D9D9; 

`;

const CancelButton = styled.div`

    cursor: pointer;
    font-size: 14px;
font-family: Roboto;
color: #0E4D9D;
font-weight: 600;
line-height: 20px;
text-align: center;

`;

const LogoutButton = styled.div`

    cursor: pointer;
    font-size: 14px;
    &:hover {
        background: #0056b3;
    }
`;

const Divider = styled.div`
    height: 50px;
    width: 1px;
    background: #D9D9D9;
`;