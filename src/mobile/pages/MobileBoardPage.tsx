import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
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
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";
import useUserStore from "../../stores/useUserStore.ts";
import findTitleOrCode from "../../utils/findTitleOrCode.ts";
import { postApiLogs, putMemberDepartment } from "../../apis/members.ts";

export default function MobileBoardPage() {
  console.log(navBarList[1].child);
  const location = useLocation();
  console.log(location.pathname);

  const { userInfo } = useUserStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
  const params = new URLSearchParams(location.search);
  const query = params.get("search") || "";
  const deptParams = useParams<{ dept: string }>();

  const mobileNavigate = useMobileNavigate();

  const { setUserInfo } = useUserStore();

  // docType 계산
  const docType = useMemo(() => {
    if (params.has("search")) return "SEARCH";
    if (location.pathname === "/m/home/notice") return "NOTICE";
    if (location.pathname === "/m/home/alert") return "ALERT";

    if (location.pathname.includes("/m/home/deptnotice")) return "DEPT_NOTICE";
    if (params.get("type") === "councilNotice") return "COUNCILNOTICE";
    return "TIPS";
  }, [location.pathname, params]);

  // title 계산
  const title = useMemo(() => {
    switch (docType) {
      case "TIPS":
      case "SEARCH":
        return "TIPS";
      case "NOTICE":
        return "학교 공지사항";
      case "DEPT_NOTICE":
        return deptParams.dept
          ? `${deptParams.dept} 공지사항`
          : "학과 공지사항";

      case "ALERT":
        return "알림";
      default:
        return "";
    }
  }, [docType, deptParams]);
  const category = params.get("category") || "전체";

  const [isDeptSelectorOpen, setIsDeptSelectorOpen] = useState(false);

  useEffect(() => {
    if (docType === "DEPT_NOTICE" && userInfo.department) {
      mobileNavigate(`/home/deptnotice/${userInfo.department}`, {
        replace: true,
      });
    }
  }, [location.pathname, userInfo.department]);

  useEffect(() => {
    const logApi = async () => {
      try {
        switch (docType) {
          case "TIPS":
            console.log("TIPS 로그");
            await postApiLogs("/api/tips");
            break;
          case "NOTICE":
            console.log("학교 공지 로그");
            await postApiLogs("/api/notice");
            break;
          case "DEPT_NOTICE":
            console.log("학과 공지 로그");
            await postApiLogs("/api/deptnotice");
            break;
          case "ALERT":
            console.log("알림 로그");
            await postApiLogs("/api/alert");
            break;
          case "SEARCH":
            console.log("검색 로그");
            await postApiLogs("/api/search");
            break;
        }
      } catch (error) {
        console.error("로그 전송 실패:", error);
      }
    };

    logApi();
  }, [docType]);

  const handleDepartmentClick = async (department: string) => {
    try {
      await putMemberDepartment(department); //서버에는 학과 CODE로 POST
      //유저 정보에는 한국어로 학과 정보 UPDATE
      const deptKorean = findTitleOrCode(department);
      setUserInfo({
        ...userInfo,
        department: deptKorean,
      });
    } catch (error) {
      console.log(error);
      alert("학과 변경을 실패했습니다.");
    }

    setIsDeptSelectorOpen(false);
  };

  // docType에 따른 메뉴 정의
  const menuItems = useMemo(() => {
    switch (docType) {
      case "DEPT_NOTICE":
        if (userInfo.department) {
          return [
            { label: "학과 변경", onClick: () => setIsDeptSelectorOpen(true) },
          ];
        } else {
          return undefined;
        }

      default:
        return undefined;
    }
  }, [docType]);

  return (
    <MobileTipsPageWrapper>
      <MobileHeader title={title} backPath={"/home"} menuItems={menuItems} />

      {navBarList[1].child && (
        <DepartmentNoticeSelector
          departments={navBarList[1].child}
          isOpen={isDeptSelectorOpen}
          setIsOpen={setIsDeptSelectorOpen}
          handleClick={handleDepartmentClick}
        />
      )}

      {(docType === "TIPS" || docType === "NOTICE") && (
        <TitleCategorySelectorWrapper>
          <CategorySelectorNew />
          <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
        </TitleCategorySelectorWrapper>
      )}

      {docType === "DEPT_NOTICE" && (
        <TitleCategorySelectorWrapper>
          {deptParams.dept && (
            <SelectButton
              onClick={() => {
                mobileNavigate("/home/deptnotice/setting");
              }}
            >
              🔔 푸시 알림 설정하기
            </SelectButton>
          )}

          <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
        </TitleCategorySelectorWrapper>
      )}

      {(docType === "TIPS" || docType === "SEARCH") && <SerachForm />}
      {docType === "DEPT_NOTICE" && !deptParams.dept && (
        <ErrorWrapper>
          <LoginImg src={loginImg} alt="횃불이 로그인 이미지" />
          <div className="error">
            등록된 학과 정보가 없어요!
            <br />
            마이페이지에서 내 학과 정보를 등록 후 이용할 수 있어요.
          </div>
          <SelectButton
            onClick={() => {
              mobileNavigate("/mypage");
              // setIsDeptSelectorOpen(!isDeptSelectorOpen);
            }}
            style={{ width: "50%", maxWidth: "250px" }}
          >
            마이페이지로 이동
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
  justify-content: space-between;
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
    width: 70%;
    max-width: 300px;
    text-align: center;

    word-break: keep-all;
  }
`;

const LoginImg = styled.img`
  width: 150px;
`;

const SelectButton = styled.button`
  width: auto;
  height: fit-content;
  padding: 12px 16px;
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
  word-break: keep-all;

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
