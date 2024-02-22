import styled from "styled-components"
import ProfileImg from "../../resource/assets/profile-logo.png"

interface NicknameProps {
    nickname: string;
}
export default function  MyInfoDetail ({nickname}:NicknameProps) {


    return (
        <InfoWrapper>
            <MyProfileImg src={ProfileImg} alt="프로필 이미지"></MyProfileImg>
            <Nickname>{nickname}</Nickname>
        </InfoWrapper>
    )
}


const InfoWrapper = styled.div`
display: flex;
justify-content: flex-end;
align-items: center;
position:absolute;
left: 90vw;

`
const Nickname = styled.div`
font-family: Inter;
font-size: 15px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
margin-left: 15px;;


`

const MyProfileImg=styled.img`
    width: 30px;
    height: 30px;
`
