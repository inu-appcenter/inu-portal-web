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
  Inbox,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";
const STORAGE_KEY_DORMITORY_UPDATED = "portal_dormitory_last_updated";

type ActiveTab = "address" | "reward" | "inout" | "apply" | "payment" | "utility" | "pledge";

/**
 * Base64 이미지를 안전한 Data URL로 변환 (공백 제거 및 포맷 감지)
 */
function toImageSrc(base64?: string): string | null {
  if (!base64 || typeof base64 !== "string") return null;
  const clean = base64.replace(/\s/g, "");
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

  // 마운트 시 캐시된 로컬 데이터를 먼저 복원
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
        const academicCached = localStorage.getItem("portal_student_info");
        if (academicCached) {
          const parsedAc = JSON.parse(academicCached);
          const restoredAc = parseDormitoryStudentInfo(parsedAc);
          setDormInfo(restoredAc);
        }
      }
    } catch (e) {
      console.warn("Dormitory cache load error:", e);
    }
  }, []);

  // 새로고침 버튼을 눌렀을 때만 ERP 직접 조회
  const loadDormitoryInfo = useCallback(async () => {
    if (!isMobileAppEnvironment()) {
      setIsPortalAccountModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage("사생 정보와 탭 데이터를 조회하고 있습니다...");

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

        try {
          localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(res.data));
          localStorage.setItem(STORAGE_KEY_DORMITORY_UPDATED, nowIso);
        } catch (storageErr) {
          console.warn("Dormitory cache save error:", storageErr);
        }
      } else {
        alert(res.errorMessage || "사생 정보 조회 중 오류가 발생했습니다.");
      }
    } catch (e: any) {
      alert(e?.message || "사생 정보 조회 실패");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }, []);

  const profile = dormInfo?.profile;

  // 모든 데이터 소스로부터 필드 매핑
  const studentName = profile?.name || dormInfo?.studentName || dormInfo?.rawFields?.korNm || dormInfo?.rawFields?.nm || "";
  const englishName = profile?.englishName || dormInfo?.rawFields?.engNm || "";
  const studentId = profile?.studentId || dormInfo?.studentId || dormInfo?.rawFields?.persNo || dormInfo?.rawFields?.stuno || "";
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

  // 프로필 이미지 소스 계산
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

  // 원시 필드 목록
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
        <ChevronRight size={11} />
        <span>생활원</span>
        <ChevronRight size={11} />
        <span>사생관리</span>
        <ChevronRight size={11} />
        <span className="current">사생정보조회(학생)</span>
      </Breadcrumb>

      <TitleContentArea
        title="사생정보조회(학생)"
        description="포털 종합정보시스템(부속행정 > 생활원 > 사생관리) 사생정보 및 7개 탭 내역을 조회합니다."
        style={{ alignItems: "stretch", width: "100%" }}
      >
        {!isMobileAppEnvironment() && (
          <WebFallbackCard>
            <Smartphone size={28} />
            <div className="title">모바일 앱 전용 기능</div>
            <div className="desc">
              학교 포털 ERP 연동은 INTIP 앱 내부의 보안 세션을 통해 안전하게 조회됩니다.
            </div>
            <ActionButton
              as="button"
              onClick={() => openIntipAppOrStore(ROUTES.LABS.PORTAL.DORMITORY)}
            >
              앱 열기
            </ActionButton>
          </WebFallbackCard>
        )}

        <ActionBar>
          <ActionButton
            as="button"
            disabled={isLoading}
            onClick={loadDormitoryInfo}
          >
            <RefreshCw size={14} className={isLoading ? "spin" : ""} style={{ marginRight: 6 }} />
            {isLoading ? loadingMessage || "조회 중..." : "정보 새로고침"}
          </ActionButton>
          {lastUpdated && (
            <UpdatedTimeText>
              <Clock size={12} />
              {formatKoreanDateTime(lastUpdated)} 기준
            </UpdatedTimeText>
          )}
        </ActionBar>

        {/* 1. 상단 사생정보 카드 */}
        <SectionBlock>
          <SectionHeader>
            <span className="title">사생정보</span>
            {year && term ? (
              <span className="term-badge">{year}년 {term}학기</span>
            ) : null}
          </SectionHeader>

          <CardContainer>
            {/* 상단 프로필 헤더: 사진 + 핵심 신원 */}
            <ProfileTopArea>
              <AvatarWrapper>
                {profilePhotoSrc ? (
                  <img src={profilePhotoSrc} alt="사생 증명사진" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={32} strokeWidth={1.5} />
                    <span>미등록</span>
                  </div>
                )}
              </AvatarWrapper>

              <IdentityWrapper>
                <div className="name-row">
                  <span className="name">{studentName || "(이름 없음)"}</span>
                  {englishName ? <span className="eng-name">{englishName}</span> : null}
                </div>
                {studentId ? <div className="student-id">학번: {studentId}</div> : null}
                <div className="tags-row">
                  {department ? <span className="tag">{department}</span> : null}
                  {grade ? <span className="tag">{grade}</span> : null}
                  {dormitoryBuilding ? <span className="tag highlight">{dormitoryBuilding}</span> : null}
                </div>
              </IdentityWrapper>
            </ProfileTopArea>

            {/* 상세 항목 리스트 (모바일 친화적인 키-값 그리드) */}
            <InfoGrid>
              <InfoCell>
                <span className="label">기숙사구분</span>
                <span className="value">{dormitoryType || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">건물구분</span>
                <span className="value">{dormitoryBuilding || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">사생번호</span>
                <span className="value">{studentDormNo || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">성별 / 국적</span>
                <span className="value">
                  {gender || "-"}{nationality ? ` / ${nationality}` : ""}
                </span>
              </InfoCell>
              <InfoCell>
                <span className="label">휴대전화번호</span>
                <span className="value">{phoneNumber || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">이메일</span>
                <span className="value">{email || "-"}</span>
              </InfoCell>
              <InfoCell fullWidth>
                <span className="label">거주지 주소</span>
                <span className="value">
                  {zipCode ? `[${zipCode}] ` : ""}
                  {address || ""} {detailedAddress || ""}
                  {!zipCode && !address && !detailedAddress ? "-" : ""}
                </span>
              </InfoCell>
            </InfoGrid>

            {/* 상벌점 배지 영역 */}
            <PointBar>
              <PointChip>
                <span className="title">상점</span>
                <span className="score merit">{meritPoints}</span>
              </PointChip>
              <PointChip>
                <span className="title">일반벌점</span>
                <span className="score demerit">{demeritPoints}</span>
              </PointChip>
              <PointChip>
                <span className="title">상쇄불가벌점</span>
                <span className="score fixed">{nonOffsetDemeritPoints}</span>
              </PointChip>
            </PointBar>
          </CardContainer>
        </SectionBlock>

        {/* 2. 하단 7개 탭 네비게이션 */}
        <SectionBlock>
          <TabsWrapper>
            <TabsScrollContainer>
              <TabChip
                active={activeTab === "address"}
                onClick={() => setActiveTab("address")}
              >
                <MapPin size={13} />
                주소사항 ({addressList.length})
              </TabChip>
              <TabChip
                active={activeTab === "reward"}
                onClick={() => setActiveTab("reward")}
              >
                <Award size={13} />
                상벌점이력 ({rewardList.length})
              </TabChip>
              <TabChip
                active={activeTab === "inout"}
                onClick={() => setActiveTab("inout")}
              >
                <LogIn size={13} />
                입퇴사이력 ({inOutList.length})
              </TabChip>
              <TabChip
                active={activeTab === "apply"}
                onClick={() => setActiveTab("apply")}
              >
                <ClipboardList size={13} />
                신청이력 ({applyList.length})
              </TabChip>
              <TabChip
                active={activeTab === "payment"}
                onClick={() => setActiveTab("payment")}
              >
                <CreditCard size={13} />
                등록/환불 ({paymentList.length})
              </TabChip>
              <TabChip
                active={activeTab === "utility"}
                onClick={() => setActiveTab("utility")}
              >
                <Zap size={13} />
                공공요금 ({utilityList.length})
              </TabChip>
              <TabChip
                active={activeTab === "pledge"}
                onClick={() => setActiveTab("pledge")}
              >
                <FileCheck size={13} />
                서약서 {pledge ? "(1)" : "(0)"}
              </TabChip>
            </TabsScrollContainer>
          </TabsWrapper>

          {/* 3. 탭별 상세 카드 목록 */}
          <TabBody>
            {/* 탭 1: 주소사항 */}
            {activeTab === "address" && (
              <div>
                {addressList.length > 0 ? (
                  <CardsList>
                    {addressList.map((item: DormitoryAddressItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailRow>
                          <span className="k">우편번호</span>
                          <span className="v">{item.zipCode || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">기본주소</span>
                          <span className="v">{item.address || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">상세주소</span>
                          <span className="v">{item.detailedAddress || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">보호자 연락처</span>
                          <span className="v">{item.guardianPhone || "-"}</span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>등록된 주소사항 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 2: 상벌점이력 */}
            {activeTab === "reward" && (
              <div>
                {rewardList.length > 0 ? (
                  <CardsList>
                    {rewardList.map((rw: DormitoryRewardItem, idx: number) => {
                      const isDemerit = rw.type.includes("벌점") || parseInt(rw.score, 10) < 0;
                      return (
                        <DetailCard key={idx}>
                          <DetailCardHeader>
                            <span className={`status-pill ${isDemerit ? "demerit" : "merit"}`}>
                              {rw.type || (isDemerit ? "벌점" : "상점")} {rw.score}점
                            </span>
                            <span className="sub-text">{rw.imposedDate || "-"}</span>
                          </DetailCardHeader>
                          <DetailRow>
                            <span className="k">상벌점명</span>
                            <span className="v font-bold">{rw.name || "-"}</span>
                          </DetailRow>
                          <DetailRow>
                            <span className="k">사유</span>
                            <span className="v">{rw.reason || "-"}</span>
                          </DetailRow>
                          {rw.offsetPossible ? (
                            <DetailRow>
                              <span className="k">상쇄가능여부</span>
                              <span className="v">{rw.offsetPossible}</span>
                            </DetailRow>
                          ) : null}
                        </DetailCard>
                      );
                    })}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>부여된 상벌점 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 3: 입퇴사이력 */}
            {activeTab === "inout" && (
              <div>
                {inOutList.length > 0 ? (
                  <CardsList>
                    {inOutList.map((io: DormitoryInOutItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">
                            {io.year ? `${io.year}년 ` : ""}{io.term ? `${io.term}학기 ` : ""}({io.dormitoryType || "기숙사"})
                          </span>
                          <span className="sub-text font-bold">{io.status || "입퇴사"}</span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">사생번호</span>
                          <span className="v">{io.studentDormNo || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">입사일자</span>
                          <span className="v">{io.checkInDate || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">퇴사일자</span>
                          <span className="v">{io.checkOutDate || "-"}</span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>입퇴사 이력이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 4: 신청이력 */}
            {activeTab === "apply" && (
              <div>
                {applyList.length > 0 ? (
                  <CardsList>
                    {applyList.map((ap: DormitoryApplyItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">
                            {ap.year ? `${ap.year}년 ` : ""}{ap.term ? `${ap.term}학기` : ""}
                          </span>
                          <span className="sub-text font-bold">{ap.passStatus || ap.applyType || "신청"}</span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">신청구분</span>
                          <span className="v">{ap.applyType || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">신청일자</span>
                          <span className="v">{ap.applyDate || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">거주기간</span>
                          <span className="v">
                            {ap.periodStart || "-"} ~ {ap.periodEnd || "-"}
                          </span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>기숙사 신청 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 5: 등록/환불이력 */}
            {activeTab === "payment" && (
              <div>
                {paymentList.length > 0 ? (
                  <CardsList>
                    {paymentList.map((pm: DormitoryPaymentItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className={`status-pill ${pm.type.includes("환불") ? "demerit" : "merit"}`}>
                            {pm.type || "등록/환불"}
                          </span>
                          <span className="sub-text">{pm.date || "-"}</span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">학기</span>
                          <span className="v">{pm.year}년 {pm.term}학기</span>
                        </DetailRow>
                        {pm.dormitoryType ? (
                          <DetailRow>
                            <span className="k">기숙사구분</span>
                            <span className="v">{pm.dormitoryType}</span>
                          </DetailRow>
                        ) : null}
                        <DetailRow>
                          <span className="k">금액</span>
                          <span className="v font-bold">
                            {pm.amount ? `${Number(pm.amount).toLocaleString()}원` : "0원"}
                          </span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>등록금 납부 및 환불 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 6: 공공요금 부과내역 */}
            {activeTab === "utility" && (
              <div>
                {utilityList.length > 0 ? (
                  <CardsList>
                    {utilityList.map((ut: DormitoryUtilityItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">사용월: {ut.useMonth || "-"}</span>
                          <span className="sub-text font-bold">
                            총 {ut.totalFee ? `${Number(ut.totalFee).toLocaleString()}원` : "0원"}
                          </span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">전기 (사용량 / 요금)</span>
                          <span className="v">{ut.electricUsage || "0"} / {Number(ut.electricFee || "0").toLocaleString()}원</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">수도 (사용량 / 요금)</span>
                          <span className="v">{ut.waterUsage || "0"} / {Number(ut.waterFee || "0").toLocaleString()}원</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">온수 / 난방 사용량</span>
                          <span className="v">{ut.hotWaterUsage || "0"} / {ut.heatingUsage || "0"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">소계 / 시설분담금</span>
                          <span className="v">
                            {Number(ut.subtotalFee || "0").toLocaleString()}원 / {Number(ut.facilityFee || "0").toLocaleString()}원
                          </span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>공공요금 부과 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}

            {/* 탭 7: 입사서약서 */}
            {activeTab === "pledge" && (
              <div>
                {pledge ? (
                  <DetailCard>
                    <DetailCardHeader>
                      <span className="status-pill merit">입사서약서</span>
                      <span className="sub-text">{pledge.consentDate ? `동의일자: ${pledge.consentDate}` : ""}</span>
                    </DetailCardHeader>
                    <DetailRow>
                      <span className="k">동의여부</span>
                      <span className="v font-bold">{pledge.consentStatus || "-"}</span>
                    </DetailRow>
                    {pledge.studentInfo ? (
                      <DetailRow>
                        <span className="k">학생정보</span>
                        <span className="v">{pledge.studentInfo}</span>
                      </DetailRow>
                    ) : null}
                    {pledge.documentContent ? (
                      <PledgeContentBox>
                        {pledge.documentContent}
                      </PledgeContentBox>
                    ) : null}
                  </DetailCard>
                ) : (
                  <EmptyNotice>
                    <Inbox size={20} strokeWidth={1.5} />
                    <span>입사서약서 체결 내역이 없습니다.</span>
                  </EmptyNotice>
                )}
              </div>
            )}
          </TabBody>
        </SectionBlock>

        {/* 4. 원시 파싱 데이터 토글 (정리된 디버그 뷰어) */}
        <DebugSection>
          <DebugHeader onClick={() => setShowRawFields(!showRawFields)}>
            <div className="title">
              <Database size={13} />
              <span>원시 데이터 확인 ({rawEntries.length}개 필드)</span>
            </div>
            <span className="toggle-hint">{showRawFields ? "접기" : "펼치기"}</span>
          </DebugHeader>

          {showRawFields && (
            <DebugBody>
              <MiniTable>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rawEntries.map(([k, v]) => (
                    <tr key={k}>
                      <td className="key">{k}</td>
                      <td className="val">
                        {v === "" ? (
                          <span className="empty-val">(빈값)</span>
                        ) : k === "phtFile2" || k === "phtFile" ? (
                          <span className="photo-val">[이미지 Base64: {v.length}자]</span>
                        ) : (
                          String(v)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </MiniTable>
            </DebugBody>
          )}
        </DebugSection>
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
  padding: 12px 16px 36px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8c95a0;
  padding: 4px 6px;
  width: 100%;
  box-sizing: border-box;

  .current {
    color: #0055b8;
    font-weight: 600;
  }
`;

const WebFallbackCard = styled.div`
  background-color: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  color: #64748b;
  margin-top: 12px;
  width: 100%;
  box-sizing: border-box;

  .title {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }

  .desc {
    font-size: 12px;
    line-height: 1.4;
  }
`;

const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  width: 100%;
  box-sizing: border-box;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const UpdatedTimeText = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
  width: 100%;
  box-sizing: border-box;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  .title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
  }

  .term-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background-color: #f1f5f9;
    color: #475569;
    font-weight: 500;
  }
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const ProfileTopArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  width: 100%;
  box-sizing: border-box;
`;

const AvatarWrapper = styled.div`
  width: 76px;
  height: 98px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #94a3b8;
    font-size: 10px;
  }
`;

const IdentityWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;

    .name {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
    }

    .eng-name {
      font-size: 12px;
      color: #64748b;
    }
  }

  .student-id {
    font-size: 12px;
    color: #475569;
    font-weight: 500;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;

    .tag {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: #f1f5f9;
      color: #334155;

      &.highlight {
        background-color: #eff6ff;
        color: #1d4ed8;
        font-weight: 600;
      }
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  gap: 10px 14px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const InfoCell = styled.div<{ fullWidth?: boolean }>`
  grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  .label {
    font-size: 11px;
    color: #8c95a0;
  }

  .value {
    font-size: 13px;
    color: #1e293b;
    font-weight: 500;
    word-break: break-all;
  }
`;

const PointBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  padding: 10px 14px 14px;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
`;

const PointChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 4px;
  min-width: 0;

  .title {
    font-size: 10px;
    color: #64748b;
  }

  .score {
    font-size: 15px;
    font-weight: 700;

    &.merit { color: #2563eb; }
    &.demerit { color: #dc2626; }
    &.fixed { color: #d97706; }
  }
`;

const TabsWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const TabsScrollContainer = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 4px 0 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabChip = styled.button<{ active?: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active }) => (active ? "#0055b8" : "#64748b")};
  background-color: ${({ active }) => (active ? "#eef6ff" : "#ffffff")};
  border: 1px solid ${({ active }) => (active ? "#bfdbfe" : "#e2e8f0")};
  border-radius: 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
`;

const TabBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DetailCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DetailCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  width: 100%;
  box-sizing: border-box;

  .status-pill {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;

    &.merit {
      background-color: #eff6ff;
      color: #1d4ed8;
    }
    &.demerit {
      background-color: #fef2f2;
      color: #dc2626;
    }
    &.neutral {
      background-color: #f1f5f9;
      color: #334155;
    }
  }

  .sub-text {
    font-size: 11px;
    color: #64748b;

    &.font-bold {
      font-weight: 600;
      color: #1e293b;
    }
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;

  .k {
    color: #64748b;
    flex-shrink: 0;
  }

  .v {
    color: #1e293b;
    text-align: right;
    word-break: break-all;

    &.font-bold {
      font-weight: 600;
    }
  }
`;

const PledgeContentBox = styled.div`
  margin-top: 6px;
  padding: 10px;
  background-color: #f8fafc;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: #475569;
  white-space: pre-wrap;
  max-height: 160px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
`;

const EmptyNotice = styled.div`
  padding: 24px 16px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const DebugSection = styled.div`
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DebugHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #f8fafc;
  cursor: pointer;
  user-select: none;
  width: 100%;
  box-sizing: border-box;

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
  }

  .toggle-hint {
    font-size: 11px;
    color: #94a3b8;
  }
`;

const DebugBody = styled.div`
  padding: 10px;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const MiniTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 11px;

  th {
    background-color: #f1f5f9;
    color: #475569;
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid #cbd5e1;
  }

  td {
    padding: 4px 8px;
    border-bottom: 1px solid #f1f5f9;
    font-family: monospace;
  }

  .key {
    color: #2563eb;
    width: 35%;
    word-break: break-all;
  }

  .val {
    color: #1e293b;
    width: 65%;
    word-break: break-all;
  }

  .empty-val {
    color: #94a3b8;
  }

  .photo-val {
    color: #059669;
  }
`;
