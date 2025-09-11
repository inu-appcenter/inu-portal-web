import styled from "styled-components";
import { useState } from "react";
import { putMemberDepartment, putMembers } from "apis/members";
import useMobileNavigate from "hooks/useMobileNavigate";
import useUserStore from "stores/useUserStore";
import { navBarList } from "../../../../old/resource/string/navBarList.tsx";
import DepartmentNoticeSelector from "../../components/notice/DepartmentNoticeSelector.tsx";
import findTitleOrCode from "../../../utils/findTitleOrCode.ts";

export default function UserModify() {
  const { setUserInfo, userInfo } = useUserStore();
  const [nickname, setNickname] = useState(userInfo.nickname);
  const [fireId, setFireId] = useState(userInfo.fireId);
  const [initialNickname] = useState(userInfo.nickname); // 최초 닉네임 저장
  const [department, setDepartment] = useState(userInfo.department);
  const mobileNavigate = useMobileNavigate();
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  console.log(userInfo);
  const handleModifyClick = async () => {
    if (nickname && nickname.length > 10) {
      alert("닉네임은 10글자를 초과할 수 없습니다.");
      return;
    }

    const Code = findTitleOrCode(department);

    try {
      // 닉네임이 변경되지 않은 경우 null로 처리
      const updatedNickname = nickname === initialNickname ? null : nickname;

      const response = await putMembers(updatedNickname, fireId);
      if (Code) {
        await putMemberDepartment(Code);
      }
      setUserInfo({
        id: response.data,
        nickname: updatedNickname || initialNickname, // 변경된 닉네임 또는 초기 닉네임 설정
        department: department,
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

  const handleDepartmentClick = (department: string) => {
    const deptKorean = findTitleOrCode(department);
    {
      deptKorean && setDepartment(deptKorean);
    }
    setIsDeptSelectorOpen(false);
  };

  return (
    <UserModifyWrapper>
      {navBarList[1].child && (
        <DepartmentNoticeSelector
          departments={navBarList[1].child}
          isOpen={isDeptSelectorOpen}
          setIsOpen={setIsDeptSelectorOpen}
          handleClick={handleDepartmentClick}
        />
      )}
      <div className="nickname">
        <h4>닉네임</h4>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="새로운 닉네임을 입력하세요!"
        />
      </div>
      <div className="nickname department">
        <h4>학과</h4>
        <div className="input-button-wrapper">
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="학과 정보를 입력해주세요!"
            readOnly={true}
          />
          <StyledButton onClick={() => setIsDeptSelectorOpen(true)}>
            학과 선택
          </StyledButton>
        </div>
      </div>
      <div className="nickname">
        <h4>프로필 이미지</h4>
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
        <StyledButton fullWidth onClick={handleModifyClick}>
          수정하기
        </StyledButton>
      </ButtonWrapper>
    </UserModifyWrapper>
  );
}

const UserModifyWrapper = styled.div`
  top: 310px;
  width: 100%;
  padding: 0 16px;
  padding-bottom: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  .nickname {
    width: 100%;
    margin-bottom: 16px;

    h4 {
      margin-bottom: 8px;
    }

    input {
      width: 100%;
      padding: 12px;
      box-sizing: border-box;
      border-radius: 8px;
      color: #404040;
      font-size: 14px;
    }

    &.department {
      .input-button-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        input {
          flex: 1; // input이 남은 공간 채우기
        }

        button {
          flex: 0; // 버튼은 내용에 맞게
        }
      }
    }
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0;

  padding: 16px;
  box-sizing: border-box;

  background-color: rgba(255, 255, 255, 0.5); /* 반투명 배경 */
  backdrop-filter: blur(10px); /* 블러 효과 */
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

const StyledButton = styled.button<{ fullWidth?: boolean }>`
  box-sizing: border-box;
  background-color: #0e4d9d;
  border: 1px solid white;
  color: white;
  padding: 12px;
  border-radius: 5px;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  min-width: fit-content;
  cursor: pointer;

  font-size: 16px;
  font-weight: 600;
`;
