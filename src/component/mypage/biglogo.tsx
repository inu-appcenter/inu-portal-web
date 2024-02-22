import styled from "styled-components"
import inuBigImg from "../../resource/assets/mypage-big-logo.png"

export default function  MypageBigLogo () {
    return (
            <MyPageLogoImg src={inuBigImg} alt="마이페이지 로고"/>
    )
}



const MyPageLogoImg = styled.img`
width: 196px;
height: 216px;
`
