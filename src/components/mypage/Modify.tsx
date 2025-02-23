import styled from "styled-components";
import useUserStore from "stores/useUserStore";
import { putMembers } from "apis/members";
import { useState } from "react";

export default function Modify() {
  const { userInfo, setUserInfo } = useUserStore();
  const [nickname, setNickname] = useState(userInfo.nickname);
  const [fireId, setFireId] = useState(userInfo.fireId);

  const handleSubmit = async () => {
    try {
      const response = await putMembers(nickname, fireId);
      alert("정보가 성공적으로 수정되었습니다.");
      setUserInfo({
        id: response.data,
        nickname: nickname,
        role: userInfo.role,
        fireId: fireId,
      });
    } catch (error) {
      console.error("회원정보 수정 실패", error);
      alert("회원정보 수정에 실패했습니다.");
    }
  };

  return (
    <ModifyWrapper>
      <h1>개인정보 수정</h1>
      <div className="userInfo-nickname">
        <div className="userInfo">
          <img
            src={`https://portal.inuappcenter.kr/images/profile/${fireId}`}
            alt=""
          />
          <h3>{nickname}</h3>
        </div>
        <div className="nickname">
          <h3>닉네임 변경</h3>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
      </div>
      <ImageSelection>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((id) => (
          <ImageOption
            key={id}
            selected={id === fireId}
            onClick={() => setFireId(id)}
          >
            <img
              src={`https://portal.inuappcenter.kr/images/profile/${id}`}
              alt={`이미지 ${id}`}
            />
          </ImageOption>
        ))}
      </ImageSelection>
      <button onClick={handleSubmit}>수정</button>
    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`
  padding: 64px;
  background: linear-gradient(to bottom, #dbebff 70%, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 32px;
  h1 {
    color: #0e4d9d;
    font-size: 32px;
    font-weight: 600;
    margin: 0;
  }
  .userInfo-nickname {
    display: flex;
    gap: 120px;
    align-items: center;
    .userInfo {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 160px;
        border-radius: 100px;
      }
      h3 {
        font-size: 24px;
      }
    }
    .nickname {
      display: flex;
      align-items: center;
      gap: 20px;
      h3 {
        font-size: 24px;
      }
      input {
        background: transparent;
        height: 60px;
        width: 360px;
        border-radius: 12px;
        border: 1px solid rgba(64, 113, 185, 1);
        font-size: 24px;
        padding-left: 24px;
      }
    }
  }
  button {
    align-self: center;
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    border: none;
    height: 60px;
    width: 200px;
    font-size: 24px;
    border-radius: 12px;
    color: white;
    font-weight: 600;
  }
`;

const ImageSelection = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
`;

const ImageOption = styled.div<{ selected: boolean }>`
  width: 100px;
  height: 100px;
  img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    border: ${({ selected }) => (selected ? "3px solid #4071B9" : "none")};
  }
`;
