import { useSelector } from "react-redux";
import styled from "styled-components";

import { useEffect, useState } from "react";
import getFireImage from "../../../../utils/getFireImage";


export default function ModifyUserInfo()  {
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
display: flex;
justify-content: flex-end;
align-items: center;
flex-direction: column;

`
const Nickname = styled.div`
font-size: 20px;
font-weight: 600;
margin-top:15px;


`

const MyProfileImg=styled.img`
width: 120px;
height: 120px;
`
