import styled from "styled-components"
import inuImg from "../../resource/assets/mypage-logo.png"

export default function  MypageLogo () {
    return (
        <MyPageLogoWrapper>
            <MyPageLogoImg src={inuImg} alt="마이페이지 로고"/>
            <MyPageLogoTitle>마이페이지</MyPageLogoTitle>
        </MyPageLogoWrapper>
    )
}

const MyPageLogoWrapper = styled.div`
    display: flex;
    padding: 25px 20px;
`

const MyPageLogoImg = styled.img`
width: 30px;
height: 30px;
vertical-align:baseline;
`

const MyPageLogoTitle = styled.p`
    font-family: Inter;
    font-size: 20px;
    font-weight: 700;
    margin:0;
    margin-left:14px;

`