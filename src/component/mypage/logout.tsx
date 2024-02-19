import styled from "styled-components"
import logoutImg from  "../../resource/assets/logout-logo.png"

export default function  MypageLogout () {
    return (
        <MyPageLogpoutWrapper>
            <MyPageLogpoutImg src={logoutImg} alt="마이페이지 로그아웃로고"/>
            <MyPageLogpoutTitle>로그아웃</MyPageLogpoutTitle>
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

const MyPageLogpoutTitle = styled.span`
display: inline;
font-family: Inter;
font-size: 17px;
font-weight: 500;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color: #656565;
margin-left: 19px;

`;
