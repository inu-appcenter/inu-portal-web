import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { putMemberDepartment, putMembers } from "@/apis/members";
import useUserStore from "@/stores/useUserStore";
import { navBarList } from "old/resource/string/navBarList";
import DepartmentNoticeSelector from "../../../components/mobile/notice/DepartmentNoticeSelector.tsx";
import findTitleOrCode from "../../../utils/findTitleOrCode.ts";
import { subscribeDepartment } from "@/apis/notices";

export default function UserModify() {
  const { setUserInfo, userInfo } = useUserStore();
  const [nickname, setNickname] = useState(userInfo.nickname);
  const [fireId, setFireId] = useState(userInfo.fireId);
  const [initialNickname] = useState(userInfo.nickname); // 최초 닉네임
  const [initialDepartment] = useState(userInfo.department); // 최초 학과
  const [department, setDepartment] = useState(userInfo.department);
  const navigate = useNavigate();
  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  console.log(userInfo);
  const handleModifyClick = async () => {
    if (nickname && nickname.length > 10) {
      alert("닉네임은 10글자를 초과할 수 없습니다.");
      return;
    }

    const Code = findTitleOrCode(department);

    try {
      // 미변경 닉네임
      const updatedNickname = nickname === initialNickname ? null : nickname;

      const response = await putMembers(updatedNickname, fireId);
      if (Code) {
        await putMemberDepartment(Code);
      }
      setUserInfo({
        id: response.data,
        nickname: updatedNickname || initialNickname,
        department: department,
        role: userInfo.role,
        fireId: Number(fireId),
      });

      // 신규 학과 구독 및 알림
      if (!initialDepartment && department && Code) {
        await subscribeDepartment(Code);
        alert(
          "성공적으로 수정되었습니다.\n\n학과공지 알리미 기능이 자동으로 활성화됩니다. 학과 공지 화면에서 설정을 변경할 수 있어요.",
        );
      } else {
        alert("성공적으로 수정되었습니다.");
      }

      navigate(`/mypage`);
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
  width: 100%;
  padding: 24px 16px 120px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8faff;

  .nickname {
    width: 100%;
    margin-bottom: 24px;
    max-width: 384px;

    h4 {
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #495057;
    }

    input {
      width: 100%;
      padding: 14px 16px;
      box-sizing: border-box;
      border-radius: 12px;
      color: #212529;
      font-size: 15px;
      font-weight: 600;
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      transition: all 0.2s;

      &:focus {
        border-color: #5e92f0;
        box-shadow: 0 0 0 3px rgba(94, 146, 240, 0.1);
      }

      &::placeholder {
        color: #adb5bd;
      }
    }

    &.department {
      .input-button-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;

        input {
          flex: 1;
          background-color: #f1f3f5; /* 읽기 전용 */
        }

        button {
          flex: 0;
          white-space: nowrap;
        }
      }
    }
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  max-width: 768px;
  display: flex;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  padding: 16px 20px 32px;
  box-sizing: border-box;

  background: linear-gradient(180deg, rgba(248, 250, 255, 0) 0%, #f8faff 40%);
  pointer-events: none;

  button {
    pointer-events: auto;
  }
`;

const ImageSelection = styled.div`
  margin: 12px 0 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const ImageOption = styled.div<{ selected: boolean }>`
  width: 100%;
  min-width: 0;
  aspect-ratio: 1 / 1;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;

  img {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    border: 3px solid
      ${({ selected }) => (selected ? "#5e92f0" : "transparent")};
    transition: all 0.2s;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    box-sizing: border-box;
    display: block;
  }

  ${({ selected }) =>
    selected &&
    `
    &::after {
      content: '✓';
      position: absolute;
      top: -6px;
      right: -6px;
      width: 24px;
      height: 24px;
      background-color: #5e92f0;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
  `}
`;

const StyledButton = styled.button<{ fullWidth?: boolean }>`
  box-sizing: border-box;
  background: linear-gradient(135deg, #5e92f0 0%, #4a7fd0 100%);
  color: white;
  padding: 14px 20px;
  border-radius: 12px;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  min-width: 100px;
  cursor: pointer;

  font-size: 16px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 12px rgba(94, 146, 240, 0.3);
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(94, 146, 240, 0.3);
  }
`;
