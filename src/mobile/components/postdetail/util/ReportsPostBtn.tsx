import styled from "styled-components";
import { postReports } from "apis/reports";
import { reportsReasons } from "resources/strings/reportsReasons";
import { useState } from "react";
import axios, { AxiosError } from "axios";

interface ReportsPostBtnProps {
  id: number;
}

export default function EditPostBtn({ id }: ReportsPostBtnProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const handleReports = async () => {
    if (!selectedReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    const comment = prompt("추가 의견을 입력해주세요. (선택 사항)");

    try {
      await postReports(id, selectedReason, comment || "");
      alert("신고가 완료되었습니다. 검토까지는 최대 24시간 소요됩니다.");
      setSelectedReason("");
      setShowDropdown(false);
    } catch (error) {
      console.error("신고하기 실패", error);
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          default:
            alert("신고하기 실패");
            break;
        }
      }
    }
  };

  return (
    <>
      <ReportsBtn onClick={() => setShowDropdown((prev) => !prev)}>
        신고하기
      </ReportsBtn>
      {showDropdown && (
        <>
          <BackGround onClick={() => setShowDropdown(false)} />
          <DropdownWrapper>
            <span className="desc">
              신고 사유에 맞지 않는 신고일 경우, 해당 신고는 처리되지 않습니다.
            </span>
            <span className="desc">
              누적 신고횟수가 3회 이상인 유저는 글 작성을 할 수 없게 됩니다.
            </span>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">신고 사유를 선택하세요</option>
              {reportsReasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div>
              <button className="reports-button" onClick={handleReports}>
                제출
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowDropdown(false)}
              >
                취소
              </button>
            </div>
          </DropdownWrapper>
        </>
      )}
    </>
  );
}

// Styled Component
const ReportsBtn = styled.span`
  width: 76px;
  height: 30px;
  border-radius: 10px;
  background: #eff2f9;
  font-size: 15px;
  font-weight: 500;
  color: #757575;
  display: flex;
  justify-content: center; /* 수평 가운데 정렬 */
  align-items: center; /* 수직 가운데 정렬 */
`;

const DropdownWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .desc {
    font-size: 12px;
  }
  .reports-button {
    color: red;
    background-color: transparent;
    border: 1px solid;
    border-radius: 4px;
  }
  select {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  div {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
  .cancel-button {
  }
`;

const BackGround = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100svw;
  height: 100dvh;
`;
