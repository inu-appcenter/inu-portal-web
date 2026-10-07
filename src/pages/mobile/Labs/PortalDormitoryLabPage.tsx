import { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import {
  checkPortalAccountLinked,
  fetchDormitoryStudentInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import {
  DormitoryStudentInfo,
  DormitoryAddressItem,
  DormitoryRewardItem,
  DormitoryInOutItem,
  DormitoryApplyItem,
  DormitoryPaymentItem,
  DormitoryUtilityItem,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import {
  Home,
  Clock,
  Smartphone,
  MapPin,
  Award,
  LogIn,
  ClipboardList,
  CreditCard,
  Zap,
  FileCheck,
  ChevronRight,
  User,
  Database,
  RefreshCw,
  Info,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";
const STORAGE_KEY_DORMITORY_UPDATED = "portal_dormitory_last_updated";

type ActiveTab = "address" | "reward" | "inout" | "apply" | "payment" | "utility" | "pledge";

/**
 * Base64 이미지를 안전한 Data URL로 변환 (BMP, JPEG, PNG 자동 감지)
 */
function toImageSrc(base64?: string): string | null {
  if (!base64 || typeof base64 !== "string") return null;
  const clean = base64.trim();
  if (!clean) return null;
  if (clean.startsWith("data:")) return clean;
  if (clean.startsWith("Qk")) return `data:image/bmp;base64,${clean}`;
  if (clean.startsWith("/9j/")) return `data:image/jpeg;base64,${clean}`;
  if (clean.startsWith("iVBOR")) return `data:image/png;base64,${clean}`;
  return `data:image/bmp;base64,${clean}`;
}

const PortalDormitoryLabPage = () => {
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isPortalAccountModalOpen, setIsPortalAccountModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("address");
  const [showRawFields, setShowRawFields] = useState(false);

  useHeader({
    title: "사생정보조회(학생)",
  });

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsFlagFetched, isLabsEnabled, navigate]);

  // 마운트 시: 자동 네트워크 호출 없이 캐시된 로컬스토리지 데이터를 먼저 복원
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DORMITORY_DATA);
      const cachedTime = localStorage.getItem(STORAGE_KEY_DORMITORY_UPDATED);

      if (cached) {
        const parsedJson = JSON.parse(cached);
        const restored = parseDormitoryStudentInfo(parsedJson);
        setDormInfo(restored);
        if (cachedTime) {
          setLastUpdated(cachedTime);
        }
      } else {
        // 혹시 기존 학적 캐시가 있으면 기초 프로필로 활용
        const academicCached = localStorage.getItem("portal_student_info");
        if (academicCached) {
          const parsedAc = JSON.parse(academicCached);
          const restoredAc = parseDormitoryStudentInfo(parsedAc);
          setDormInfo(restoredAc);
        }
      }
    } catch (e) {
      console.warn("Dormitory cache read error:", e);
    }
  }, []);

  // 사용자가 명시적으로 '가져오기 / 새로고침' 버튼을 눌렀을 때만 호출
  const loadDormitoryInfo = useCallback(async () => {
    if (!isMobileAppEnvironment()) {
      setIsPortalAccountModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("생활원 사생 정보 및 7개 탭 데이터를 ERP에서 안전하게 조회하고 있습니다...");

      const isLinked = await checkPortalAccountLinked();
      if (!isLinked) {
        setIsPortalAccountModalOpen(true);
        setIsLoading(false);
        return;
      }

      const res = await fetchDormitoryStudentInfoFromApp();
      if (res.success && res.data) {
        setDormInfo(res.data);
        const nowIso = new Date().toISOString();
        setLastUpdated(nowIso);

        // 캐싱 저장: 다음에 접속했을 때 즉시 보여주기 위함
        try {
          localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(res.data));
          localStorage.setItem(STORAGE_KEY_DORMITORY_UPDATED, nowIso);
        } catch (storageErr) {
          console.warn("Dormitory cache save error:", storageErr);
        }
      } else {
        alert(res.errorMessage || "생활원 사생 정보 조회 중 오류가 발생했습니다.");
      }
    } catch (e: any) {
      alert(e?.message || "생활원 사생 정보 조회 실패");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const profile = dormInfo?.profile;

  // 모든 소스(profile, dormInfo 최상위, rawFields)로부터 종합 매핑
  const studentName = profile?.name || dormInfo?.studentName || dormInfo?.rawFields?.korNm || dormInfo?.rawFields?.nm || "";
  const englishName = profile?.englishName || dormInfo?.rawFields?.engNm || "";
  const gender = profile?.gender || dormInfo?.rawFields?.genGbn || "";
  const nationality = profile?.nationality || dormInfo?.rawFields?.natGbn || "";
  const department = profile?.department || dormInfo?.rawFields?.deptNm || dormInfo?.rawFields?.hgNm || "";
  const grade = profile?.grade || (dormInfo?.rawFields?.hySeqGbn ? `${dormInfo.rawFields.hySeqGbn}학년` : "");
  const dormitoryType = profile?.dormitoryType || dormInfo?.dormitoryBuilding || dormInfo?.rawFields?.dormGbn || "";
  const dormitoryBuilding = profile?.dormitoryBuilding || dormInfo?.dormitoryBuilding || dormInfo?.rawFields?.dormBdNm || dormInfo?.rawFields?.dormBdCd || "";
  const studentDormNo = profile?.studentDormNo || dormInfo?.rawFields?.domstuNo || dormInfo?.rawFields?.domStuNo || "";
  const phoneNumber = profile?.phoneNumber || dormInfo?.rawFields?.handpNo || "";
  const email = profile?.email || dormInfo?.rawFields?.email || "";
  const zipCode = profile?.zipCode || dormInfo?.rawFields?.zipNo || "";
  const address = profile?.address || dormInfo?.rawFields?.addr || "";
  const detailedAddress = profile?.detailedAddress || dormInfo?.rawFields?.detaAddr || "";
  const meritPoints = profile?.meritPoints ?? dormInfo?.meritPoints ?? dormInfo?.rawFields?.ardScr1 ?? "0";
  const demeritPoints = profile?.demeritPoints ?? dormInfo?.demeritPoints ?? dormInfo?.rawFields?.ardScr2 ?? "0";
  const nonOffsetDemeritPoints = profile?.nonOffsetDemeritPoints ?? dormInfo?.rawFields?.ardScr3 ?? "0";
  const year = profile?.year || dormInfo?.appliedYear || dormInfo?.rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || dormInfo?.rawFields?.tmGbn || "";

  // 프로필 이미지 URL 계산 (phtFile, phtFile2 또는 학적 캐시 fallback)
  const profilePhotoSrc = useMemo(() => {
    const rawPhoto =
      profile?.photoBase64 ||
      dormInfo?.photoBase64 ||
      profile?.rawFields?.phtFile2 ||
      profile?.rawFields?.phtFile ||
      dormInfo?.rawFields?.phtFile2 ||
      dormInfo?.rawFields?.phtFile;

    if (rawPhoto) {
      return toImageSrc(rawPhoto);
    }

    try {
      const academicCached = localStorage.getItem("portal_student_info");
      if (academicCached) {
        const parsed = JSON.parse(academicCached);
        const fallbackPic = parsed?.rawFields?.phtFile2 || parsed?.rawFields?.phtFile;
        if (fallbackPic) {
          return toImageSrc(fallbackPic);
        }
      }
    } catch {}

    return null;
  }, [profile, dormInfo]);

  // 원시 필드 목록 (키-값 쌍 정렬)
  const rawEntries = useMemo(() => {
    const rf = profile?.rawFields || dormInfo?.rawFields || {};
    return Object.entries(rf).sort(([a], [b]) => a.localeCompare(b));
  }, [profile, dormInfo]);

  const addressList = dormInfo?.addressList || [];
  const rewardList = dormInfo?.rewardList || [];
  const inOutList = dormInfo?.inOutList || [];
  const applyList = dormInfo?.applyList || [];
  const paymentList = dormInfo?.paymentList || [];
  const utilityList = dormInfo?.utilityList || [];
  const pledge = dormInfo?.pledge || null;

  return (
    <Container>
      <Breadcrumb>
        <span>부속행정</span>
        <ChevronRight size={12} />
        <span>생활원</span>
        <ChevronRight size={12} />
        <span>사생관리</span>
        <ChevronRight size={12} />
        <span className="current">사생정보조회(학생)</span>
      </Breadcrumb>

      <TitleContentArea
        title="사생정보조회(학생)"
        description="포털 종합정보시스템(부속행정 > 생활원 > 사생관리 > 사생정보조회) 화면의 기본 사생정보 및 7개 탭 정보를 조회합니다. 조회된 데이터는 기기에 안전하게 캐싱되어 다음 접속 시 즉시 표시됩니다."
      >
        <NoticeBox>
          <div className="icon">
            <Home size={18} />
          </div>
          <div className="text">
            <strong>로컬 보안 캐싱 및 투명 데이터 안내</strong>
            <p>
              사생 정보는 외부 서버에 절대 전송되지 않으며, 기기 내 로컬 저장소에 안전하게 보관됩니다.
              없는 데이터는 임의의 기본값으로 속이지 않고 빈 상태 그대로 표기됩니다.
            </p>
          </div>
        </NoticeBox>

        {!isMobileAppEnvironment() && (
          <WebFallbackCard>
            <Smartphone size={32} />
            <div className="title">인팁 모바일 앱 전용 기능입니다</div>
            <div className="desc">
              포털 ERP 사생정보조회는 모바일 앱의 안전한 백그라운드 SSO 세션을 통해 작동합니다.
            </div>
            <ActionButton
              as="button"
              onClick={() => openIntipAppOrStore(ROUTES.LABS.PORTAL.DORMITORY)}
            >
              인팁 앱 열기 / 설치
            </ActionButton>
          </WebFallbackCard>
        )}

        <ActionArea>
          <ActionButton
            as="button"
            disabled={isLoading}
            onClick={loadDormitoryInfo}
          >
            <RefreshCw size={15} className={isLoading ? "spin" : ""} style={{ marginRight: 6 }} />
            {isLoading
              ? loadingMessage || "조회 중..."
              : dormInfo
                ? "사생 정보 새로고침 (ERP 갱신)"
                : "사생 정보 가져오기"}
          </ActionButton>
          {lastUpdated && (
            <LastUpdatedText>
              <Clock size={13} />
              최근 갱신: {formatKoreanDateTime(lastUpdated)} (캐시 보관됨)
            </LastUpdatedText>
          )}
        </ActionArea>

        {/* UI 레이아웃 자체는 데이터 유무와 상관없이 항상 온전히 표시 */}
        <ContentSection>
          {/* 1. 상단 사생정보 카드 (증명사진 + 필드 그리드) */}
          <SectionHeader>
            <div className="title">사생정보</div>
            <div className="badge-row">
              {year && term ? (
                <div className="badge">{year}년 {term}학기</div>
              ) : (
                <div className="badge gray">학기 정보 없음</div>
              )}
            </div>
          </SectionHeader>

          <ProfileLayoutCard>
            {/* 좌측 증명사진 영역 */}
            <PhotoSection>
              <PhotoContainer>
                {profilePhotoSrc ? (
                  <img src={profilePhotoSrc} alt="사생 증명사진" className="avatar-img" />
                ) : (
                  <div className="no-avatar">
                    <User size={40} strokeWidth={1.5} />
                    <span>사진 미등록</span>
                  </div>
                )}
              </PhotoContainer>
              <div className="photo-label">사생 사진</div>
            </PhotoSection>

            {/* 우측 사생정보 그리드 테이블 */}
            <TableGridArea>
              <TableGrid>
                <TableRow>
                  <TableCol>
                    <span className="th">성명</span>
                    <span className="td">{studentName || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">성명(영문)</span>
                    <span className="td">{englishName || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">성별</span>
                    <span className="td">{gender || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                </TableRow>

                <TableRow>
                  <TableCol>
                    <span className="th">국적</span>
                    <span className="td">{nationality || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">학부(과)/부서</span>
                    <span className="td">{department || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">학년구분</span>
                    <span className="td">{grade || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                </TableRow>

                <TableRow>
                  <TableCol>
                    <span className="th">기숙사구분</span>
                    <span className="td">{dormitoryType || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">기숙사건물구분</span>
                    <span className="td">{dormitoryBuilding || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol>
                    <span className="th">사생번호</span>
                    <span className="td">{studentDormNo || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                </TableRow>

                <TableRow>
                  <TableCol>
                    <span className="th">휴대전화번호</span>
                    <span className="td">{phoneNumber || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                  <TableCol span={2}>
                    <span className="th">이메일</span>
                    <span className="td">{email || <EmptyText>(없음)</EmptyText>}</span>
                  </TableCol>
                </TableRow>

                <TableRow>
                  <TableCol span={3}>
                    <span className="th">거주지</span>
                    <span className="td">
                      {zipCode ? `[${zipCode}] ` : ""}
                      {address || ""} {detailedAddress || ""}
                      {!zipCode && !address && !detailedAddress && (
                        <EmptyText>(등록된 주소 없음)</EmptyText>
                      )}
                    </span>
                  </TableCol>
                </TableRow>
              </TableGrid>

              {/* 상벌점 배지 바 */}
              <PointBadgeRow>
                <PointBox>
                  <span className="label">상점</span>
                  <span className="val merit">{meritPoints}</span>
                </PointBox>
                <PointBox>
                  <span className="label">일반벌점</span>
                  <span className="val demerit">{demeritPoints}</span>
                </PointBox>
                <PointBox>
                  <span className="label">상쇄불가벌점</span>
                  <span className="val fixed-demerit">{nonOffsetDemeritPoints}</span>
                </PointBox>
              </PointBadgeRow>
            </TableGridArea>
          </ProfileLayoutCard>

          {/* 2. 하단 7개 탭 네비게이션 */}
          <TabHeader>
            <TabButton
              active={activeTab === "address"}
              onClick={() => setActiveTab("address")}
            >
              <MapPin size={14} />
              주소사항 ({addressList.length})
            </TabButton>
            <TabButton
              active={activeTab === "reward"}
              onClick={() => setActiveTab("reward")}
            >
              <Award size={14} />
              상벌점이력 ({rewardList.length})
            </TabButton>
            <TabButton
              active={activeTab === "inout"}
              onClick={() => setActiveTab("inout")}
            >
              <LogIn size={14} />
              입퇴사이력 ({inOutList.length})
            </TabButton>
            <TabButton
              active={activeTab === "apply"}
              onClick={() => setActiveTab("apply")}
            >
              <ClipboardList size={14} />
              신청이력 ({applyList.length})
            </TabButton>
            <TabButton
              active={activeTab === "payment"}
              onClick={() => setActiveTab("payment")}
            >
              <CreditCard size={14} />
              등록/환불이력 ({paymentList.length})
            </TabButton>
            <TabButton
              active={activeTab === "utility"}
              onClick={() => setActiveTab("utility")}
            >
              <Zap size={14} />
              공공요금 ({utilityList.length})
            </TabButton>
            <TabButton
              active={activeTab === "pledge"}
              onClick={() => setActiveTab("pledge")}
            >
              <FileCheck size={14} />
              입사서약서 {pledge ? "(1)" : "(0)"}
            </TabButton>
          </TabHeader>

          {/* 3. 탭별 상세 내용 (테이블 형식으로 구조화) */}
          <TabContentContainer>
            {/* 탭 1: 주소사항 */}
            {activeTab === "address" && (
              <div>
                {addressList.length > 0 ? (
                  <ItemList>
                    {addressList.map((addr: DormitoryAddressItem, idx: number) => (
                      <ItemCard key={idx}>
                        <ItemRow>
                          <span className="label">우편번호</span>
                          <span className="value">{addr.zipCode || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">기본주소</span>
                          <span className="value">{addr.address || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">상세주소</span>
                          <span className="value">{addr.detailedAddress || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">보호자 연락처</span>
                          <span className="value">{addr.guardianPhone || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                      </ItemCard>
                    ))}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 주소사항(우편번호, 주소, 보호자연락처) 내역이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 2: 상벌점이력 */}
            {activeTab === "reward" && (
              <div>
                {rewardList.length > 0 ? (
                  <ItemList>
                    {rewardList.map((rw: DormitoryRewardItem, idx: number) => {
                      const isDemerit = rw.type.includes("벌점") || parseInt(rw.score, 10) < 0;
                      return (
                        <ItemCard key={idx}>
                          <ItemHeader>
                            <span className={`badge ${isDemerit ? "demerit" : "merit"}`}>
                              {rw.type || (isDemerit ? "벌점" : "상점")} {rw.score}점
                            </span>
                            <span className="date">{rw.imposedDate || "(일자 미기재)"}</span>
                          </ItemHeader>
                          <ItemRow>
                            <span className="label">상벌점명</span>
                            <span className="value font-medium">{rw.name || <EmptyText>(빈값)</EmptyText>}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">사유</span>
                            <span className="value">{rw.reason || <EmptyText>(빈값)</EmptyText>}</span>
                          </ItemRow>
                          {rw.offsetPossible && (
                            <ItemRow>
                              <span className="label">상쇄가능구분</span>
                              <span className="value">{rw.offsetPossible}</span>
                            </ItemRow>
                          )}
                        </ItemCard>
                      );
                    })}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 상벌점(구분, 상벌점명, 사유, 점수, 부과일자) 부여 내역이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 3: 입퇴사이력 */}
            {activeTab === "inout" && (
              <div>
                {inOutList.length > 0 ? (
                  <ItemList>
                    {inOutList.map((io: DormitoryInOutItem, idx: number) => (
                      <ItemCard key={idx}>
                        <ItemHeader>
                          <span className="badge inout">
                            {io.year ? `${io.year}년 ` : ""}{io.term ? `${io.term}학기 ` : ""}({io.dormitoryType || "기숙사"})
                          </span>
                          <span className="status">{io.status || "입퇴사"}</span>
                        </ItemHeader>
                        <ItemRow>
                          <span className="label">사생번호</span>
                          <span className="value">{io.studentDormNo || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">입사일자</span>
                          <span className="value">{io.checkInDate || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">퇴사일자</span>
                          <span className="value">{io.checkOutDate || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                      </ItemCard>
                    ))}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 입퇴사이력(연도, 학기, 기숙사, 입사일자, 퇴사일자) 내역이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 4: 신청이력 */}
            {activeTab === "apply" && (
              <div>
                {applyList.length > 0 ? (
                  <ItemList>
                    {applyList.map((ap: DormitoryApplyItem, idx: number) => (
                      <ItemCard key={idx}>
                        <ItemHeader>
                          <span className="badge inout">
                            {ap.year ? `${ap.year}년 ` : ""}{ap.term ? `${ap.term}학기` : ""}
                          </span>
                          <span className="status">{ap.passStatus || ap.applyType || "신청"}</span>
                        </ItemHeader>
                        <ItemRow>
                          <span className="label">신청구분</span>
                          <span className="value">{ap.applyType || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">신청일자</span>
                          <span className="value">{ap.applyDate || <EmptyText>(빈값)</EmptyText>}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">거주기간</span>
                          <span className="value">
                            {ap.periodStart || "(시작 미기재)"} ~ {ap.periodEnd || "(종료 미기재)"}
                          </span>
                        </ItemRow>
                      </ItemCard>
                    ))}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 기숙사 신청이력(신청구분, 신청일자, 거주기간, 합격여부) 내역이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 5: 등록/환불이력 */}
            {activeTab === "payment" && (
              <div>
                {paymentList.length > 0 ? (
                  <ItemList>
                    {paymentList.map((pm: DormitoryPaymentItem, idx: number) => (
                      <ItemCard key={idx}>
                        <ItemHeader>
                          <span className={`badge ${pm.type.includes("환불") ? "demerit" : "merit"}`}>
                            {pm.type || "등록/환불"}
                          </span>
                          <span className="date">{pm.date || "(일자 미기재)"}</span>
                        </ItemHeader>
                        <ItemRow>
                          <span className="label">학기</span>
                          <span className="value">{pm.year}년 {pm.term}학기</span>
                        </ItemRow>
                        {pm.dormitoryType && (
                          <ItemRow>
                            <span className="label">기숙사구분</span>
                            <span className="value">{pm.dormitoryType}</span>
                          </ItemRow>
                        )}
                        <ItemRow>
                          <span className="label">금액</span>
                          <span className="value font-medium">
                            {pm.amount ? `${Number(pm.amount).toLocaleString()}원` : <EmptyText>(0원)</EmptyText>}
                          </span>
                        </ItemRow>
                      </ItemCard>
                    ))}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 등록금 납부 및 환불 처리 내역이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 6: 공공요금 부과내역 */}
            {activeTab === "utility" && (
              <div>
                {utilityList.length > 0 ? (
                  <ItemList>
                    {utilityList.map((ut: DormitoryUtilityItem, idx: number) => (
                      <ItemCard key={idx}>
                        <ItemHeader>
                          <span className="badge inout">사용월: {ut.useMonth || "(미기재)"}</span>
                          <span className="font-medium">
                            총 {ut.totalFee ? `${Number(ut.totalFee).toLocaleString()}원` : "0원"}
                          </span>
                        </ItemHeader>
                        <ItemRow>
                          <span className="label">전기 (사용량 / 요금)</span>
                          <span className="value">{ut.electricUsage || "0"} / {Number(ut.electricFee || "0").toLocaleString()}원</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">수도 (사용량 / 요금)</span>
                          <span className="value">{ut.waterUsage || "0"} / {Number(ut.waterFee || "0").toLocaleString()}원</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">온수 / 난방 사용량</span>
                          <span className="value">{ut.hotWaterUsage || "0"} / {ut.heatingUsage || "0"}</span>
                        </ItemRow>
                        <ItemRow>
                          <span className="label">소계 / 시설분담금</span>
                          <span className="value">
                            {Number(ut.subtotalFee || "0").toLocaleString()}원 / {Number(ut.facilityFee || "0").toLocaleString()}원
                          </span>
                        </ItemRow>
                      </ItemCard>
                    ))}
                  </ItemList>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>조회된 공공요금 부과내역(전기, 수도, 온수, 난방, 시설분담금)이 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}

            {/* 탭 7: 입사서약서 */}
            {activeTab === "pledge" && (
              <div>
                {pledge ? (
                  <ItemCard>
                    <ItemHeader>
                      <span className="badge merit">입사서약서</span>
                      {pledge.consentDate && (
                        <span className="date">동의일: {pledge.consentDate}</span>
                      )}
                    </ItemHeader>
                    <ItemRow>
                      <span className="label">동의여부</span>
                      <span className="value font-medium">{pledge.consentStatus || <EmptyText>(미기재)</EmptyText>}</span>
                    </ItemRow>
                    {pledge.studentInfo && (
                      <ItemRow>
                        <span className="label">학생정보</span>
                        <span className="value">{pledge.studentInfo}</span>
                      </ItemRow>
                    )}
                    {pledge.documentContent && (
                      <PledgeTextBox>
                        {pledge.documentContent}
                      </PledgeTextBox>
                    )}
                  </ItemCard>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>체결된 입사서약서 정보가 없습니다.</span>
                  </EmptyStructureBox>
                )}
              </div>
            )}
          </TabContentContainer>

          {/* 4. 원시 파싱 데이터 투명 노출 (Raw Fields Viewer) */}
          <RawSection>
            <RawSectionHeader onClick={() => setShowRawFields(!showRawFields)}>
              <div className="title-left">
                <Database size={15} />
                <span>원시 파싱 데이터 (Raw Fields: {rawEntries.length}개 필드)</span>
              </div>
              <div className="btn-toggle">
                {showRawFields ? "접기 ▲" : "전체 펼쳐보기 ▼"}
              </div>
            </RawSectionHeader>

            {showRawFields && (
              <RawFieldsBody>
                {rawEntries.length > 0 ? (
                  <RawTable>
                    <thead>
                      <tr>
                        <th>필드명 (Key)</th>
                        <th>파싱 값 (Value)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawEntries.map(([key, val]) => (
                        <tr key={key}>
                          <td className="key-cell">{key}</td>
                          <td className="val-cell">
                            {val === "" ? (
                              <EmptyText>"" (빈값)</EmptyText>
                            ) : key === "phtFile2" || key === "phtFile" ? (
                              <span className="photo-tag">[Base64 이미지 데이터: {val.length}자]</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </RawTable>
                ) : (
                  <EmptyStructureBox>
                    <Info size={16} />
                    <span>현재 로드된 원시 필드 데이터가 없습니다.</span>
                  </EmptyStructureBox>
                )}

                {dormInfo && (
                  <JsonDumpContainer>
                    <div className="dump-label">전체 객체 JSON Dump:</div>
                    <pre className="json-dump">
                      {JSON.stringify(dormInfo, null, 2)}
                    </pre>
                  </JsonDumpContainer>
                )}
              </RawFieldsBody>
            )}
          </RawSection>
        </ContentSection>
      </TitleContentArea>

      <PortalAccountModal
        isOpen={isPortalAccountModalOpen}
        onClose={() => setIsPortalAccountModalOpen(false)}
        onSuccess={() => {
          setIsPortalAccountModalOpen(false);
          loadDormitoryInfo();
        }}
      />
    </Container>
  );
};

export default PortalDormitoryLabPage;

const Container = styled.div`
  padding: 16px;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #718096;
  padding: 4px 8px;
  background-color: #f7fafc;
  border-radius: 6px;

  .current {
    color: #2b6cb0;
    font-weight: 600;
  }
`;

const NoticeBox = styled.div`
  display: flex;
  gap: 12px;
  background-color: #f0f7ff;
  padding: 14px 16px;
  border-radius: 12px;
  color: #0055b8;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 12px;

  .icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    margin: 4px 0 0 0;
    color: #3b82f6;
    font-size: 12px;
  }
`;

const WebFallbackCard = styled.div`
  background-color: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  color: #64748b;
  margin-top: 16px;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }

  .desc {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LastUpdatedText = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #8c95a0;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #1a202c;
  }

  .badge-row {
    display: flex;
    gap: 6px;
  }

  .badge {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    background-color: #ebf8ff;
    color: #2b6cb0;
    font-weight: 600;

    &.gray {
      background-color: #edf2f7;
      color: #718096;
    }
  }
`;

const ProfileLayoutCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;

  @media (max-width: 520px) {
    flex-direction: column;
  }
`;

const PhotoSection = styled.div`
  width: 130px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background-color: #f8fafc;
  border-right: 1px solid #edf2f7;

  .photo-label {
    font-size: 11px;
    color: #718096;
    margin-top: 8px;
  }

  @media (max-width: 520px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #edf2f7;
    padding: 16px;
  }
`;

const PhotoContainer = styled.div`
  width: 100px;
  height: 128px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .no-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: #94a3b8;
    font-size: 11px;
  }
`;

const TableGridArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TableGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #edf2f7;

  &:last-child {
    border-bottom: none;
  }
`;

const TableCol = styled.div<{ span?: number }>`
  flex: ${({ span }) => span || 1};
  display: flex;
  flex-direction: column;
  padding: 9px 11px;
  border-right: 1px solid #edf2f7;

  &:last-child {
    border-right: none;
  }

  .th {
    font-size: 11px;
    color: #718096;
    margin-bottom: 2px;
  }

  .td {
    font-size: 13px;
    font-weight: 500;
    color: #2d3748;
    word-break: break-all;
  }
`;

const EmptyText = styled.span`
  color: #a0aec0;
  font-weight: 400;
  font-style: italic;
  font-size: 12px;
`;

const PointBadgeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 12px;
  background-color: #f7fafc;
  border-top: 1px solid #e2e8f0;
`;

const PointBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 6px 4px;

  .label {
    font-size: 11px;
    color: #718096;
    margin-bottom: 2px;
  }

  .val {
    font-size: 15px;
    font-weight: 700;

    &.merit {
      color: #3182ce;
    }
    &.demerit {
      color: #e53e3e;
    }
    &.fixed-demerit {
      color: #dd6b20;
    }
  }
`;

const TabHeader = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active }) => (active ? "#2b6cb0" : "#718096")};
  background-color: ${({ active }) => (active ? "#ebf8ff" : "#ffffff")};
  border: 1px solid ${({ active }) => (active ? "#bee3f8" : "#e2e8f0")};
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease-in-out;
`;

const TabContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ItemCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  .badge {
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 6px;
    font-weight: 600;

    &.merit {
      background-color: #ebf8ff;
      color: #2b6cb0;
    }
    &.demerit {
      background-color: #fff5f5;
      color: #e53e3e;
    }
    &.inout {
      background-color: #f7fafc;
      color: #4a5568;
      border: 1px solid #e2e8f0;
    }
  }

  .date {
    font-size: 11px;
    color: #a0aec0;
  }

  .status {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
  }
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;

  .label {
    color: #718096;
  }

  .value {
    color: #2d3748;
    text-align: right;
  }

  .font-medium {
    font-weight: 600;
  }
`;

const PledgeTextBox = styled.div`
  margin-top: 8px;
  padding: 10px;
  background-color: #f7fafc;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #4a5568;
  white-space: pre-wrap;
  max-height: 180px;
  overflow-y: auto;
`;

const EmptyStructureBox = styled.div`
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
`;

const RawSection = styled.div`
  margin-top: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #ffffff;
  overflow: hidden;
`;

const RawSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background-color: #f8fafc;
  cursor: pointer;
  user-select: none;

  .title-left {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  .btn-toggle {
    font-size: 12px;
    color: #2563eb;
    font-weight: 500;
  }
`;

const RawFieldsBody = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RawTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    background-color: #f1f5f9;
    color: #475569;
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid #cbd5e1;
    font-weight: 600;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  .key-cell {
    font-family: monospace;
    color: #2563eb;
    font-weight: 600;
    width: 35%;
    word-break: break-all;
  }

  .val-cell {
    font-family: monospace;
    color: #1e293b;
    word-break: break-all;
  }

  .photo-tag {
    color: #059669;
    font-weight: 600;
  }
`;

const JsonDumpContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .dump-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .json-dump {
    padding: 12px;
    background-color: #0f172a;
    color: #38bdf8;
    border-radius: 8px;
    font-size: 11px;
    font-family: monospace;
    max-height: 250px;
    overflow-y: auto;
    margin: 0;
  }
`;
