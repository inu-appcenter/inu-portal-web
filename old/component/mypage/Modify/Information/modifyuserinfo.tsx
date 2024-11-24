import { useSelector } from "react-redux";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getFireImages } from "../../../../utils/API/Images";

interface Info {
  user: {
    token: string;
    nickname: string;
    fireId: number;
  };
}

export default function ModifyUserInfo() {
  const nickname = useSelector((state: Info) => state.user.nickname);
  const token = useSelector((state: Info) => state.user.token);
  const fireId = useSelector((state: Info) => state.user.fireId);
  const [image, setImage] = useState<string | undefined>("");

  const fetchImage = async () => {
    try {
      const response = await getFireImages(token, fireId);
      if (response.status === 200) {
        setImage(response.body);
      }
    } catch (error) {
      console.error('이미지 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [token, fireId]);

  return (
    <InfoWrapper>
      <MyProfileImg src={image} alt="프로필 이미지" />
      <Nickname>{nickname}</Nickname>
    </InfoWrapper>
  );
}

const InfoWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-top: 15px;
`;

const MyProfileImg = styled.img`
  width: 120px;
  height: 120px;
`;
