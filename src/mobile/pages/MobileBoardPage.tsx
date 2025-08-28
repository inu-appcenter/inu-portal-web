import styled from "styled-components";
import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import ViewModeButtons from "mobile/components/tips/ViewModeButtons";
import TipsListContainer from "mobile/containers/tips/TipsListContainer";
import SerachForm from "mobile/containers/home/SerachForm";
import { useResetTipsStore } from "reducer/resetTipsStore";
import MobileWriteButton from "mobile/components/tips/MobileWriteButton";
import CategorySelectorNew from "../components/common/CategorySelectorNew.tsx";
import MobileHeader from "../containers/common/MobileHeader.tsx";
import DepartmentNoticeSelector from "../components/notice/DepartmentNoticeSelector.tsx";
import { navBarList } from "../../../old/resource/string/navBarList.tsx";
import loginImg from "../../resources/assets/login/login-modal-logo.svg";

export default function MobileBoardPage() {
  console.log(navBarList[1].child);
  const location = useLocation();
  console.log(location.pathname);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  const deptParams = useParams<{ dept: string }>();

  // docType 계산
  const docType = useMemo(() => {
    if (params.has("search")) return "SEARCH";
    if (location.pathname === "/m/home/notice") return "NOTICE";
    if (location.pathname.includes("/m/home/deptnotice")) return "DEPT_NOTICE";
    if (params.get("type") === "councilNotice") return "COUNCILNOTICE";
    return "TIPS";
  }, [location.pathname, params]);

  // title 계산
  const title = useMemo(() => {
    switch (docType) {
      case "TIPS":
        return "TIPS";
      case "NOTICE":
        return "학교 공지사항";
      case "DEPT_NOTICE":
        return deptParams.dept
          ? `${deptParams.dept} 공지사항`
          : "학과 공지사항";
      default:
        return "";
    }
  }, [docType, deptParams]);
  const category = params.get("category") || "전체";

  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  return (
    <MobileTipsPageWrapper>
      <MobileHeader title={title} backPath={"/home"} />

      {navBarList[1].child && (
        <DepartmentNoticeSelector
          departments={navBarList[1].child}
          isOpen={isDeptSelectorOpen}
          setIsOpen={setIsDeptSelectorOpen}
        />
      )}

      <TitleCategorySelectorWrapper>
        {(docType === "TIPS" || docType === "NOTICE") && (
          <CategorySelectorNew />
        )}

        <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      </TitleCategorySelectorWrapper>
      {(docType === "TIPS" || docType === "SEARCH") && <SerachForm />}
      {docType === "DEPT_NOTICE" && !deptParams.dept && (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">학과를 선택해주세요!</div>
          <SelectButton
            onClick={() => {
              setIsDeptSelectorOpen(!isDeptSelectorOpen);
            }}
          >
            학과 선택
          </SelectButton>
        </ErrorWrapper>
      )}

      <TipsListContainer
        key={resetKey}
        viewMode={viewMode}
        docType={docType}
        dept={deptParams.dept}
        category={category}
        query={query}
      />
      {(docType === "TIPS" || docType === "SEARCH") && <MobileWriteButton />}
    </MobileTipsPageWrapper>
  );
}

const MobileTipsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  gap: 8px;
  padding: 16px;
  padding-top: 72px;

  box-sizing: border-box;
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: fit-content;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin-top: 100px;
  div {
    font-size: 20px;
  }
`;

const LoginImg = styled.img`
  width: 150px;
`;

const SelectButton = styled.button`
  width: 200px;
  height: fit-content;
  padding: 8px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7a6dd0; // 기존 보라보다 화면과 조화로운 톤
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 25px / 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:hover {
    background: linear-gradient(
      90deg,
      #6b5ec7,
      #8a79e0
    ); // 자연스러운 호버 그라데이션
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;
