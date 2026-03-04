import styled from "styled-components";
import { useEffect, useState } from "react";
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
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import React from "react";
import Switch from "@/components/common/Switch";

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
  const handleToggleAllAlarm = async (checked: boolean) => {
    try {
      if (checked) {
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

      setAllAlarm(checked);
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
      <Box
        style={{
          background: "linear-gradient(135deg, #e0eaff 0%, #f0f4ff 100%)",
          margin: "0 16px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(94, 146, 240, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      >
        <AllAlarmCheckBoxWrapper
          onClick={() => handleToggleAllAlarm(!allAlarm)}
        >
          <div>
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
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={allAlarm} onCheckedChange={handleToggleAllAlarm} />
          </div>
        </AllAlarmCheckBoxWrapper>
      </Box>

      <KeyWordSettingWrapper>
        <TitleContentArea
          title={"키워드 알림 설정"}
          style={{ alignItems: "flex-start" }}
        >
          <Box style={{ padding: "16px", borderRadius: "16px" }}>
            <Wrapper>
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
          </Box>
        </TitleContentArea>

        <TitleContentArea
          title={"등록된 키워드 목록"}
          style={{ alignItems: "flex-start" }}
        >
          <Box
            style={{
              padding: "8px 16px",
              borderRadius: "16px",
              minHeight: "160px",
              maxHeight: "300px",
              overflowY: "auto",
              position: "relative",
              justifyContent:
                !allAlarm &&
                keywords.filter((item) => item.keyword !== null).length === 0
                  ? "center"
                  : "flex-start",
            }}
          >
            <ListWrapper>
              {!allAlarm &&
              keywords.filter((item) => item.keyword !== null).length === 0 ? (
                <EmptyState>등록된 키워드가 없어요.</EmptyState>
              ) : (
                keywords
                  .filter(
                    (item): item is typeof item & { keyword: string } =>
                      item.keyword !== null,
                  )
                  .map((item, index, filtered) => (
                    <React.Fragment key={item.keywordId}>
                      <RegisteredKeywordItem
                        keyword={item.keyword}
                        onDelete={() => handleDeleteKeyword(item.keywordId)}
                      />
                      {index < filtered.length - 1 && <Divider margin={"0"} />}
                    </React.Fragment>
                  ))
              )}
            </ListWrapper>
          </Box>
        </TitleContentArea>

        {/* 전체 오버레이 - 키워드 설정 영역 전체를 덮음 */}
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
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  background-color: #f3f7fe;
  padding: 16px 0 40px;
  min-height: 100svh;
`;

const AllAlarmCheckBoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  gap: 16px;
  word-break: keep-all;
  .first-line {
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .second-line {
    color: #5e92f0;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const KeyWordSettingWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const EmptyState = styled.div`
  padding: 32px 0;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 14px 16px;
  padding-right: 60px;
  box-sizing: border-box;
  background-color: #f8f9fa;

  color: #333;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e92f0;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(94, 146, 240, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-weight: 500;
  }
`;

const TextButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);

  border: none;
  background: none;
  cursor: pointer;

  font-size: 15px;
  font-weight: 700;
  color: ${(props) => (props.disabled ? "#ced4da" : "#5e92f0")};
  transition: color 0.2s ease;

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
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
`;

const OverlayMessage = styled.div`
  background-color: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  line-height: 1.6;
  border: 1px solid #f1f3f5;
`;
