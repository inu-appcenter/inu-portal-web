import styled from "styled-components";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getFireImages } from "old/utils/API/Images";

interface Info {
  user: {
    token: string;
    nickname: string;
    fireId: number;
  };
}

export default function MyInfo() {
  const token = useSelector((state: Info) => state.user.token);
  const nickname = useSelector((state: Info) => state.user.nickname);
  const fireId = useSelector((state: Info) => state.user.fireId);
  const [image, setImage] = useState<string | undefined>("");

  const fetchImage = async () => {
    try {
      const response = await getFireImages(token, fireId);
      if (response.status === 200) {
        setImage(response.body);
      }
    } catch (error) {
      console.error("이미지 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [token, fireId]);

  return (
    <InfoWrapper>
      <Nickname>{nickname}</Nickname>
      <MyProfileImg src={image} alt="프로필 이미지" />
    </InfoWrapper>
  );
}

const InfoWrapper = styled.div`
  display: flex;

  @media (max-width: 768px) {
    /* 모바일 */
    display: none;
  }
`;

const Nickname = styled.div`
  font-size: 15px;
  font-weight: 600;
  line-height: 30px;
  letter-spacing: 0px;
  margin-left: 36px;
  @media (max-width: 768px) {
    /* 모바일 */
    margin-left: 0px;
  }
`;

const MyProfileImg = styled.img`
  width: 30px;
  height: 30px;
  margin-left: 13px;
`;
