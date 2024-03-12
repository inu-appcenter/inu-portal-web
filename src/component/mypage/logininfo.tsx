import { useSelector } from "react-redux";
import styled from "styled-components";


export default function LoginInfo()  {
    const nickname = useSelector((state: any) => state.user.nickname);
    const fireId = useSelector((state: any) => state.user.fireId);

    return (
        <InfoWrapper>
            <MyProfileImg src={`https://portal.inuappcenter.kr/api/images/${fireId}`} alt="프로필 이미지"></MyProfileImg>
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
