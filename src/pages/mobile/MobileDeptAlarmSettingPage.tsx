import styled from "styled-components";
import { useEffect, useState } from "react";
import MobileHeader from "../../containers/mobile/common/MobileHeader.tsx";
import RegisteredKeywordItem from "../../components/desktop/notice/RegisteredKeywordItem.tsx";
import { Keyword } from "@/types/notices";
import {
  createKeyword,
  deleteKeyword,
  getKeywords,
  subscribeDepartment,
} from "@/apis/notices";
import useUserStore from "../../stores/useUserStore.ts";
import findTitleOrCode from "../../utils/findTitleOrCode.ts";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew.tsx";
import { useLocation } from "react-router-dom";
import { NoticeRecommendKeywords } from "@/resources/strings/NoticeRecommendKeywords";
import { useHeader } from "@/context/HeaderContext";
// import TitleContentArea from "../../components/common/TitleContentArea.tsx";

export default function MobileDeptAlarmSettingPage() {
  const { userInfo } = useUserStore();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [allAlarm, setAllAlarm] = useState(false); // 전체 공지 알림 체크박스 상태

  // location.search가 바뀔 때마다 keyword 업데이트
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    setKeyword(newParams.get("category") || "");
  }, [location.search]);

  useEffect(() => {
    fetchKeywords();
  }, []);
  useEffect(() => {
    // keyword가 null인 항목이 하나라도 있으면 allAlarm true
    if (keywords.some((k) => k.keyword === null)) {
      setAllAlarm(true);
    }
  }, [keywords]);

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
      await createKeyword(keyword, findTitleOrCode(userInfo.department));
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
        if (
          !window.confirm(
            "전체 알림을 켤까요? 기존에 등록한 키워드는 삭제됩니다.",
          )
        ) {
          return;
        }
        await subscribeDepartment(findTitleOrCode(userInfo.department));
      } else {
        // keyword가 null인 항목만 필터링 - null은 학과 전체 알림
        const nullKeywords = keywords.filter((k) => k.keyword === null);
        await Promise.all(nullKeywords.map((k) => deleteKeyword(k.keywordId)));
      }

      setAllAlarm(!allAlarm);
      fetchKeywords();
    } catch (error) {
      console.error("전체 공지 알림 설정 실패:", error);
    }
  };

  // 헤더 설정 주입
  useHeader({
    title: "학과 공지 푸시알림 설정",
  });

  return (
    <MobileTipsPageWrapper>
      <MobileHeader />

      <AllAlarmCheckBoxWrapper>
        <Checkbox checked={allAlarm} onChange={handleToggleAllAlarm} />
        <div onClick={handleToggleAllAlarm}>
          <div className="first-line">전체 공지 알림 받기</div>
          <div className="second-line">
            {allAlarm ? (
              <>
                {keywords.find((k) => k.keyword === null)?.department}의 모든
                공지사항 푸시알림을 받고 있어요.
              </>
            ) : (
              <>키워드에 상관 없이 모든 알림을 받을 수 있습니다.</>
            )}
          </div>
        </div>
      </AllAlarmCheckBoxWrapper>
      <KeyWordSettingWrapper style={{ position: "relative" }}>
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
          <CategorySelectorNew categories={NoticeRecommendKeywords} />
        </Wrapper>
        <Wrapper>
          <Label>등록된 키워드 목록</Label>
          <ListWrapper>
            {keywords.map((item) =>
              item.keyword ? (
                <RegisteredKeywordItem
                  key={item.keywordId}
                  keyword={item.keyword}
                  onDelete={() => handleDeleteKeyword(item.keywordId)}
                />
              ) : null,
            )}
          </ListWrapper>
        </Wrapper>

        {/* 전체 오버레이 */}
        {allAlarm && (
          <Overlay>
            <OverlayMessage>
              전체 공지 알림이 켜져 있어
              <br />
              키워드 알림 설정을 사용할 수 없습니다.
            </OverlayMessage>
          </Overlay>
        )}
      </KeyWordSettingWrapper>

      {/*<MoreFeaturesBox*/}
      {/*  title={"알려드립니다"}*/}
      {/*  content={*/}
      {/*    "현재 iPhone에서 푸시알림이 정상적으로 이루어지지 않고 있고, 해당 현상은 9월 19일 전까지 수정 예정입니다.\n미리 설정해두시면 오류가 수정된 시점부터 알림을 받아보실 수 있습니다."*/}
      {/*  }*/}
      {/*/>*/}
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

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.6); // 부드러운 반투명
  backdrop-filter: blur(1px); // 블러 효과로 시각적으로 깔끔하게
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  z-index: 10;
  border-radius: 8px;
`;

const OverlayMessage = styled.div`
  background-color: #ffffff;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #333;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
`;
