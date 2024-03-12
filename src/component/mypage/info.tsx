import styled from "styled-components"
import {  useSelector } from "react-redux"

export default function  MyInfo () {
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
margin:49px 0 54px 104px;
`
const Nickname = styled.div`
font-family: Inter;
font-size: 25px;
font-weight: 700;
margin-left:13px;
line-height: 47px;
`

const MyProfileImg=styled.img`
width: 50px;
    height: 50px;
`
