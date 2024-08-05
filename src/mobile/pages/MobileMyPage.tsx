import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getMembers } from '../../utils/API/Members';
import { useEffect, useState } from 'react';

import { MyPageActive,MyPageCategory } from '../../resource/string/m-mypage';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../reducer/userSlice';
import UserInfo from '../containers/mypage/UserInfo';


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

    const handleClick = (title:string) => {
        switch (title) {
            case '내가 쓴 글':
                navigate('m/mypage/post')
                break;
            case '좋아요한 글':
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
                handleLogout();
            break;
            case '회원탈퇴':
                
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
                        <img src={category.image}/>
                        <p>{category.title}</p>
                        </div>
                    ))}
                </CategoryWrapper>
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
     top:48%;
    display: flex;
    z-index: 15;
    /* row-gap:30px; */
    border-radius:10px;
    flex-direction: column;
    margin:0 26px;
    width: 80%;
    div {
        width: 100%;
        display:flex;
        align-items: center;
        justify-content: flex-start;
        background-color: #fff;
        padding:10px;
        border-radius:10px;
        border-bottom: line ar-gradient(0deg, #DF5532, #DF5532),
        linear-gradient(0deg, #E0E0E0, #E0E0E0);
        img {
            width:36px;
            height:36px;
            margin-right:18px;
        }
    }
`