import styled from "styled-components";
import { useState, useEffect } from "react";
import MobileHeader from "../containers/common/MobileHeader.tsx";
import RegisteredKeywordItem from "../../components/notice/RegisteredKeywordItem.tsx";
import { Keyword } from "../../types/notices.ts";
import {
  createKeyword,
  deleteKeyword,
  getKeywords,
  subscribeDepartment,
} from "../../apis/notices.ts";

export default function MobileDeptAlarmSettingPage() {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [allAlarm, setAllAlarm] = useState(false); // 전체 공지 알림 체크박스 상태

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      const res = await getKeywords();
      setKeywords(res.data);
    } catch (error) {
      console.error("키워드 목록 불러오기 실패:", error);
    }
  };

  const handleAddKeyword = async () => {
    if (!keyword) return;
    try {
      await createKeyword(keyword, "KOREAN"); // 예시: 학과 임시 KOREAN
      setKeyword("");
      fetchKeywords();
    } catch (error) {
      console.error("키워드 등록 실패:", error);
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    if (!window.confirm("키워드를 삭제할까요?")) {
      return;
    }
    try {
      await deleteKeyword(keywordId);
      fetchKeywords();
    } catch (error) {
      console.error("키워드 삭제 실패:", error);
    }
  };

  // 전체 공지 알림 구독 (체크박스 연동)
  const handleToggleAllAlarm = async () => {
    try {
      if (!allAlarm) {
        // 체크 ON → 학과 구독
        await subscribeDepartment("KOREAN"); // 학과 예시값
      } else {
        // 체크 OFF → 모든 학과 알림 해제 (예: KOREAN 해제)
        const target = keywords.find((k) => k.department === "KOREAN");
        if (target) {
          await deleteKeyword(target.keywordId);
        }
      }
      setAllAlarm(!allAlarm);
      fetchKeywords();
    } catch (error) {
      console.error("전체 공지 알림 설정 실패:", error);
    }
  };

  return (
    <MobileTipsPageWrapper>
      <MobileHeader title={"학과 공지 푸시알림 설정"} />
      <AllAlarmCheckBoxWrapper>
        <Checkbox checked={allAlarm} onChange={handleToggleAllAlarm} />
        <div>
          <div className="first-line">전체 공지 알림 받기</div>
          <div className="second-line">
            키워드에 상관 없이 모든 알림을 받을 수 있습니다.
          </div>
        </div>
      </AllAlarmCheckBoxWrapper>
      <KeyWordSettingWrapper>
        <Wrapper>
          <Label>키워드 알림 설정</Label>
          <InputWrapper>
            <StyledInput
              placeholder="알림 받을 키워드를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <TextButton disabled={!keyword} onClick={handleAddKeyword}>
              등록
            </TextButton>
          </InputWrapper>
        </Wrapper>
        <Wrapper>
          <Label>등록된 키워드 목록</Label>
          <ListWrapper>
            {keywords.map((item) => (
              <RegisteredKeywordItem
                key={item.keywordId}
                keyword={item.keyword ?? ""}
                onDelete={() => handleDeleteKeyword(item.keywordId)}
              />
            ))}
          </ListWrapper>
        </Wrapper>
      </KeyWordSettingWrapper>
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  flex: 1;
  width: 100%;
  padding: 16px;
  padding-top: 84px;

  box-sizing: border-box;
`;

const AllAlarmCheckBoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;

  .first-line {
    color: #444;
    font-size: 18px;
    font-weight: 700;
  }

  .second-line {
    color: #818181;
    font-size: 12px;
    font-weight: 500;
    line-height: 28px;
  }
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #5e92f0;
  border-radius: 4px;
  cursor: pointer;
  position: relative;

  &:checked {
    border-color: #5e92f0;
  }

  &:checked::after {
    content: "✔";
    position: absolute;
    top: -3px;
    left: 3px;
    font-size: 16px;
    color: #5e92f0;
  }

  &:hover {
    border-color: #0056b3;
  }
`;

const Label = styled.label`
  color: #444;
  font-size: 16px;
  font-weight: 700;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const KeyWordSettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  border-radius: 5px;
  border: 1px solid #888;
  padding: 12px;
  padding-right: 50px;
  box-sizing: border-box;

  color: #444;
  font-size: 16px;
  font-weight: 700;

  &::placeholder {
    color: #c0c0c0;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }
`;

const TextButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);

  border: none;
  background: none;
  cursor: pointer;

  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.disabled ? "#ccc" : "#5e92f0")};

  &:disabled {
    cursor: not-allowed;
  }
`;
