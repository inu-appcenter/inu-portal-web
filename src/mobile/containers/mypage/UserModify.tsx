import styled from "styled-components";
import { useState } from "react";
import { putMembers } from "apis/members";
import useMobileNavigate from "hooks/useMobileNavigate";
import useUserStore from "stores/useUserStore";

export default function UserModify() {
  const { setUserInfo, userInfo } = useUserStore();
  const [nickname, setNickname] = useState(userInfo.nickname);
  const [fireId, setFireId] = useState(userInfo.fireId);
  const [initialNickname] = useState(userInfo.nickname); // 최초 닉네임 저장
  const mobileNavigate = useMobileNavigate();

  const handleModifyClick = async () => {
    if (nickname && nickname.length > 10) {
      alert("닉네임은 10글자를 초과할 수 없습니다.");
      return;
    }

    try {
      // 닉네임이 변경되지 않은 경우 null로 처리
      const updatedNickname = nickname === initialNickname ? null : nickname;

      const response = await putMembers(updatedNickname, fireId);
      setUserInfo({
        id: response.data,
        nickname: updatedNickname || initialNickname, // 변경된 닉네임 또는 초기 닉네임 설정
        role: userInfo.role,
        fireId: Number(fireId),
      });
      alert("성공적으로 수정되었습니다.");
      mobileNavigate(`/mypage`);
    } catch (error) {
      console.error("회원정보 수정 실패", error);
      alert("회원정보 수정에 실패했습니다.");
    }
  };

  return (
    <UserModifyWrapper>
      <div className="nickname">
        <h4>닉네임</h4>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="새로운 닉네임을 입력하세요!"
        />
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
      <ButtonWrapper>
        <Modify onClick={handleModifyClick}>수정</Modify>
      </ButtonWrapper>
    </UserModifyWrapper>
  );
}

const UserModifyWrapper = styled.div`
  //position: absolute;
  top: 310px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .nickname {
    width: 90%;

    h4 {
      margin-bottom: 8px;
    }

    input {
      width: 90%;
      padding: 12px;
      border-radius: 8px;
      color: #404040;
      font-size: 10px;
    }
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const ImageSelection = styled.div`
  margin: 24px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

const Modify = styled.button`
  margin: 0 24px;
  box-sizing: border-box;
  margin-bottom: 90px;
  background-color: #0e4d9d;
  border: 1px solid white;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 5px;
`;
