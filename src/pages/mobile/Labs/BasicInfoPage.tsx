import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";

// API 및 타입 임포트
import { getMyBasicInfo } from "@/apis/portal";
import { StudentInfo } from "@/types/portal";
import Divider from "@/components/common/Divider";
import InfoBottomSheet from "@/components/mobile/portal/InfoBottomSheet";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";

/**
 * 개별 정보 항목 컴포넌트
 */
interface InfoItemProps {
  title: string;
  description: string;
}

const InfoItem = ({ title, description }: InfoItemProps) => (
  <InfoItemWrapper>
    <div className="title">{title}</div>
    <div className="description">{description}</div>
  </InfoItemWrapper>
);

const BasicInfoPage = () => {
  // 상태 관리
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  // 입력 필드 상태
  const [portalId, setPortalId] = useState("");
  const [portalPassword, setPortalPassword] = useState("");

  // 컴포넌트 마운트 시 데이터 복구
  useEffect(() => {
    const savedData = localStorage.getItem("portal_student_info");
    const savedTime = localStorage.getItem("portal_info_last_updated");

    if (savedData && savedTime) {
      setStudentInfo(JSON.parse(savedData));
      setLastUpdated(savedTime);
      setIsFetched(true);
    } else {
      setIsFetched(false);
      setIsBottomSheetOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsEnabled, isLabsFlagFetched, navigate]);

  useEffect(() => {
    if (!isLabsFlagFetched || !isLabsEnabled) {
      return;
    }

    const logApi = async () => {
      await postApiLogs("/api/labs/basic-info");
    };

    void logApi();
  }, [isLabsEnabled, isLabsFlagFetched]);

  const isInputValid = portalId.trim() !== "" && portalPassword.trim() !== "";

  const isRefetchAvailable = useMemo(() => {
    if (!lastUpdated) return false;

    const last = new Date(lastUpdated).getTime();
    const now = Date.now();

    const diff = now - last;

    return diff >= 24 * 60 * 60 * 1000; // 24시간
  }, [lastUpdated]);

  // 데이터 가져오기 및 저장
  const handleFetchData = async () => {
    if (!isInputValid || isLoading) return;

    setIsLoading(true);
    try {
      const res = await getMyBasicInfo({ portalId, portalPassword });
      alert("성공적으로 데이터를 가져왔어요.");
      const now = new Date().toISOString();

      setStudentInfo(res.data);
      setLastUpdated(now);
      setIsFetched(true);
      setIsBottomSheetOpen(false);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);

      localStorage.setItem("portal_student_info", JSON.stringify(res.data));
      localStorage.setItem("portal_info_last_updated", now);
    } catch (error) {
      console.error("조회 실패:", error);
      alert("정보를 가져오는 데 실패했습니다. 계정 정보를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기화 처리
  const handleReset = () => {
    setIsBottomSheetOpen(true);
  };

  const menuItems = useMemo(() => {
    if (isFetched) {
      return [
        {
          label: "데이터 삭제",
          onClick: () => {
            if (window.confirm("기기에 저장된 학적 정보를 삭제할까요?")) {
              localStorage.removeItem("portal_student_info");
              localStorage.removeItem("portal_info_last_updated");
              setStudentInfo(null);
              setLastUpdated(null);
              setIsFetched(false);
              setPortalId("");
              setPortalPassword("");
            }
          },
        },
      ];
    } else {
      return undefined;
    }
  }, [isFetched]);

  useHeader({
    title: "내 기본 학적 정보",
    menuItems,
  });

  if (isLabsFlagFetched && !isLabsEnabled) {
    return null;
  }

  return (
    <MoreAppsPageWrapper>
      <InfoBottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        title="내 기본 학적 정보 가져오기"
        isLoading={isLoading}
      >
        <BottomSheetContentWrapper>
          <DescriptionSection>
            <GuideList>
              <GuideItem>
                <div className="content">
                  <h3>아래 데이터를 가져올 수 있습니다.</h3>
                  <p>기본 인적 사항, 소속 및 학적 상태, 이수 및 성적 정보</p>
                </div>
              </GuideItem>
              <GuideItem>
                <div className="content">
                  <h3>가져온 데이터는 이 기기 안에만 저장됩니다.</h3>
                  <p>
                    인천대학교 포털에서 가져오는 작업은 학교 내 앱센터 서버에서
                    진행되지만, 서버에 일체 저장하지 않습니다.
                  </p>
                </div>
              </GuideItem>
              <GuideItem>
                <div className="content">
                  <h3>이 기기에 저장된 데이터를 삭제하려면</h3>
                  <p>
                    우측 상단의 더보기 메뉴를 눌러 데이터 삭제 버튼을 누르세요.
                  </p>
                </div>
              </GuideItem>
            </GuideList>
          </DescriptionSection>

          <LoginForm>
            <InputGroup>
              <label>포털 아이디</label>
              <input
                type="text"
                placeholder="학번을 입력하세요"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <label>포털 비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)}
              />
            </InputGroup>
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ActionButton
                as="button"
                onClick={handleFetchData}
                disabled={!isInputValid || isLoading}
              >
                {isLoading ? "가져오는 중..." : "포털에서 가져오기"}
              </ActionButton>
            </div>
          </LoginForm>
        </BottomSheetContentWrapper>
      </InfoBottomSheet>

      <ContentSection>
        <TitleContentArea description="인천대학교 포털 사이트에서 내 기본 학적 정보를 가져옵니다. 가져오는 데이터는 기본 인적 사항, 소속 및 학적 상태, 이수 및 성적 정보이며, 서버에는 데이터를 일체 저장하지 않습니다." />
        {isFetched && (
          <>
            <UpdateInfoText>
              마지막 업데이트: {formatKoreanDateTime(lastUpdated)}
            </UpdateInfoText>
            <TitleContentArea title={"기본 인적 사항"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="성명"
                      description={`${studentInfo?.koreanName} (${studentInfo?.englishName})`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="생년월일"
                      description={studentInfo?.birthDate || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="성별"
                      description={studentInfo?.genderName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="휴대전화"
                      description={studentInfo?.mobilePhone || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="국적"
                      description={studentInfo?.nationalityName || ""}
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
            <TitleContentArea title={"소속 및 학적 상태"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="학번"
                      description={studentInfo?.studentId || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="학적상태"
                      description={studentInfo?.enrollmentStatusName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="과정"
                      description={studentInfo?.courseName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="단과대학"
                      description={studentInfo?.collegeName || "-"}
                    />
                    <Divider />
                  </div>
                  <div className="grid-item">
                    <InfoItem
                      title="학과(전공)"
                      description={studentInfo?.majorName || "-"}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="지도교수"
                      description={studentInfo?.advisorProfessorName || ""}
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
            <TitleContentArea title={"이수 및 성적 정보"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="평균평점"
                      description={`${studentInfo?.gradeAverage?.trim()} / 4.5`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="취득학점"
                      description={`${studentInfo?.acquiredCredits} 학점`}
                    />
                    <Divider />
                  </div>
                  <div className="grid-item">
                    <InfoItem
                      title="이수학기"
                      description={`${studentInfo?.completedSemesterCount} 학기`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="졸업예정"
                      description={
                        studentInfo?.graduationExpectedYn === "1"
                          ? "대상"
                          : "비대상"
                      }
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
          </>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
            gap: "12px",
          }}
        >
          <ActionButton
            as="button"
            onClick={handleReset}
            disabled={isFetched && !isRefetchAvailable}
          >
            {isFetched ? "다시 가져오기" : "포털에서 가져오기"}
          </ActionButton>
        </div>
        {isFetched && !isRefetchAvailable && (
          <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
            24시간 이후에 다시 가져올 수 있습니다.
          </div>
        )}
      </ContentSection>
    </MoreAppsPageWrapper>
  );
};

export default BasicInfoPage;

const MoreAppsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 50px 16px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  padding: 0 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 13px;
    font-weight: 600;
    color: #4a4a4a;
  }
  input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    font-size: 15px;
    outline: none;
    &:focus {
      border-color: #6f9ffc;
    }
  }
`;

const UpdateInfoText = styled.div`
  font-size: 12px;
  color: #969696;
  text-align: right;
  margin-top: -12px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;

  .grid-item {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;

    /* 마지막 줄(최대 2개) Divider 제거 */
    .grid-item:nth-last-child(-n + 2) > *:last-child {
      display: none;
    }
  }
`;

const InfoItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .title {
    color: #969696;
    font-size: 12px;
    font-weight: 500;
  }
  .description {
    color: #000;
    font-size: 16px;
    font-weight: 600;
  }
`;

const DescriptionSection = styled.div`
  padding: 0 20px;

  // @media ${DESKTOP_MEDIA} {
  //   width: 100%;
  //   padding: 0;
  //   max-width: none;
  // }
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${DESKTOP_MEDIA} {
    gap: 36px;
  }
`;

const GuideItem = styled.div`
  display: flex;
  gap: 4px;

  .number {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    min-width: 20px;
  }

  .content {
    h3 {
      font-size: 16px;
      color: #333;
      margin: 0 0 4px;
      font-weight: 700;

      strong {
        font-weight: 700;
      }
    }

    p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }
`;

const BottomSheetContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;
