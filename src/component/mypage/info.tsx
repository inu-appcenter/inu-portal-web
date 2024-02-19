import styled from "styled-components"
import ProfileImg from "../../resource/assets/profile-logo.png"
export default function  MyInfo () {
    return (
        <InfoWrapper>
            <MyProfileImg src={ProfileImg} alt="프로필 이미지"></MyProfileImg>
            <Nickname>메롱이닷</Nickname>
        </InfoWrapper>
    )
}


const InfoWrapper = styled.div`
display: flex;
margin:49px 0 54px 104px;
`
const Nickname = styled.div`
font-family: Inter;
font-size: 25px;
font-weight: 500;
margin-left:13px;
line-height: 47px;
`

const MyProfileImg=styled.img`
`
