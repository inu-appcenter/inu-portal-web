import styled from "styled-components"
import logoutImg from  "../../resource/assets/logout-logo.png"
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../reducer/userSlice";

export default function  MypageLogout () {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(logoutUser());
        navigate('/');
    };
    return (
        <MyPageLogpoutWrapper>
            <MyPageLogpoutImg src={logoutImg} alt="마이페이지 로그아웃로고"/>
            <MyPageLogpoutTitle onClick={handleLogout}>로그아웃</MyPageLogpoutTitle>
        </MyPageLogpoutWrapper>
    )
}


const MyPageLogpoutWrapper = styled.div`
    display: flex;
    padding: 25px 20px;
    margin-top: 72px;
`
const MyPageLogpoutImg= styled.img`
display: inline-block;
width: 24px;
height: 24px;

`;

const MyPageLogpoutTitle = styled.button`
display: inline;
font-family: Inter;
font-size: 17px;
font-weight: 500;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #656565;
margin-left: 19px;
border:none;
background-color: white;
`;
