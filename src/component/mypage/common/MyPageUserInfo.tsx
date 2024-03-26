import { useSelector } from "react-redux";
import styled from "styled-components";
import getFireImage from "../../../utils/getFireImage";
import { useEffect, useState } from "react";


export default function MyPageUserInfo()  {
    const nickname = useSelector((state: any) => state.user.nickname);
    const token = useSelector((state: any) => state.user.token);
    const fireId = useSelector((state: any) => state.user.fireId);
    console.log(fireId,"현재 횃불이 아이디");
    const [image, setImage] = useState<string | undefined>("");
    const fetchImage = async () => {
        const imageUrl = await getFireImage(token,fireId);
        setImage(imageUrl);
      };
    
      useEffect(() => {
        fetchImage();
      }, [token,fireId]);
    return (
        <InfoWrapper>
            <MyProfileImg src={image} alt="프로필 이미지"></MyProfileImg>
            <Nickname>{nickname}</Nickname>
        </InfoWrapper>
    )
}

const InfoWrapper = styled.div`
flex-shrink: 0;

display: flex;
justify-content: flex-end;
align-items: center;


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
