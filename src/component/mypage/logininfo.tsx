import { useSelector } from "react-redux";
import styled from "styled-components";
import ProfileImg from "../../resource/assets/profile-logo.png"

export default function LoginInfo()  {
    const token = useSelector((state: any) => state.user.token);
    const nickname = useSelector((state: any) => state.user.nickname);
    console.log("token",token,"nickname",nickname);

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
