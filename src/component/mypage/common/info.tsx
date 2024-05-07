import styled from "styled-components"
import {  useSelector } from "react-redux"
import getFireImage from "../../../utils/getFireImage";
import { useEffect, useState } from "react";
interface Info {
    user: {
      token: string;
      nickname:string;
      fireId:number;
    };
  }
export default function  MyInfo () {
    const token = useSelector((state: Info) => state.user.token);
    const nickname = useSelector((state: Info) => state.user.nickname);
    const fireId = useSelector((state: Info) => state.user.fireId);
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
            <Nickname>{nickname}</Nickname>
            <MyProfileImg src={image} alt="프로필 이미지"></MyProfileImg>
        </InfoWrapper>
    )
}


const InfoWrapper = styled.div`
  display: flex;

  @media (max-width: 768px) { /* 모바일 */
    display: none;
  }
`
const Nickname = styled.div`
    font-family: Inter;
    font-size: 15px;
    font-weight: 600;
    line-height: 30px;
    letter-spacing: 0px;
    margin-left: 36px;
    @media (max-width: 768px) { /* 모바일 */
      margin-left: 0px;
    }
`

const MyProfileImg=styled.img`
    width: 30px;
    height: 30px;
    margin-left:13px;
`
