import { useState, useEffect, useCallback } from "react";
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
} from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import {
  Home,
  Clock,
  Smartphone,
  Code,
  MapPin,
  Award,
  LogIn,
  ClipboardList,
  CreditCard,
  Zap,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

type ActiveTab = "address" | "reward" | "inout" | "apply" | "payment" | "utility" | "pledge";

const PortalDormitoryLabPage = () => {
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isPortalAccountModalOpen, setIsPortalAccountModalOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("address");

  useHeader({
    title: "사생정보조회(학생)",
  });

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsFlagFetched, isLabsEnabled, navigate]);

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
        setLastUpdated(new Date().toISOString());
        setIsFetched(true);
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

  useEffect(() => {
    loadDormitoryInfo();
  }, [loadDormitoryInfo]);

  const profile = dormInfo?.profile;

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
        description="포털 종합정보시스템(부속행정 > 생활원 > 사생관리 > 사생정보조회) 화면의 기본 사생정보 및 7개 탭(주소사항, 상벌점이력, 입퇴사이력, 신청이력, 등록/환불이력, 공공요금, 입사서약서) 정보를 조회합니다."
      >
        <NoticeBox>
          <div className="icon">
            <Home size={18} />
          </div>
          <div className="text">
            <strong>로컬 보안 브릿지 조회 안내</strong>
            <p>
              사생 정보는 외부 서버에 절대 전송되지 않으며, 사용자 기기 내부의 포털 ERP 세션을 통해
              직접 로컬 브라우저로 가져옵니다. 실제 등록된 내역만 정확하게 표시됩니다.
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

        {isMobileAppEnvironment() && (
          <ActionArea>
            <ActionButton
              as="button"
              disabled={isLoading}
              onClick={loadDormitoryInfo}
            >
              {isLoading ? loadingMessage || "조회 중..." : "사생 정보 새로고침"}
            </ActionButton>
            {lastUpdated && (
              <LastUpdatedText>
                <Clock size={13} />
                최근 갱신: {formatKoreanDateTime(lastUpdated)}
              </LastUpdatedText>
            )}
          </ActionArea>
        )}

        {dormInfo && (
          <ContentSection>
            {/* 1. 상단 사생정보 카드 */}
            <SectionHeader>
              <div className="title">사생정보</div>
              {profile?.year && profile?.term && (
                <div className="badge">{profile.year}년 {profile.term}학기</div>
              )}
            </SectionHeader>

            {profile ? (
              <ProfileCard>
                <TableGrid>
                  <TableRow>
                    <TableCol>
                      <span className="th">성명</span>
                      <span className="td">{profile.name || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">성명(영문)</span>
                      <span className="td">{profile.englishName || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">성별</span>
                      <span className="td">{profile.gender || "-"}</span>
                    </TableCol>
                  </TableRow>

                  <TableRow>
                    <TableCol>
                      <span className="th">국적</span>
                      <span className="td">{profile.nationality || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">학부(과)/부서</span>
                      <span className="td">{profile.department || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">학년구분</span>
                      <span className="td">{profile.grade || "-"}</span>
                    </TableCol>
                  </TableRow>

                  <TableRow>
                    <TableCol>
                      <span className="th">기숙사구분</span>
                      <span className="td">{profile.dormitoryType || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">기숙사건물구분</span>
                      <span className="td">{profile.dormitoryBuilding || "-"}</span>
                    </TableCol>
                    <TableCol>
                      <span className="th">사생번호</span>
                      <span className="td">{profile.studentDormNo || "-"}</span>
                    </TableCol>
                  </TableRow>

                  <TableRow>
                    <TableCol>
                      <span className="th">휴대전화번호</span>
                      <span className="td">{profile.phoneNumber || "-"}</span>
                    </TableCol>
                    <TableCol span={2}>
                      <span className="th">이메일</span>
                      <span className="td">{profile.email || "-"}</span>
                    </TableCol>
                  </TableRow>

                  <TableRow>
                    <TableCol span={3}>
                      <span className="th">거주지</span>
                      <span className="td">
                        {profile.zipCode ? `[${profile.zipCode}] ` : ""}
                        {profile.address || ""} {profile.detailedAddress || ""}
                        {!profile.zipCode && !profile.address && !profile.detailedAddress && "-"}
                      </span>
                    </TableCol>
                  </TableRow>
                </TableGrid>

                {/* 상벌점 요약 바 */}
                <PointBadgeRow>
                  <PointBox>
                    <span className="label">상점</span>
                    <span className="val merit">{profile.meritPoints || "0"}</span>
                  </PointBox>
                  <PointBox>
                    <span className="label">일반벌점</span>
                    <span className="val demerit">{profile.demeritPoints || "0"}</span>
                  </PointBox>
                  <PointBox>
                    <span className="label">상쇄불가벌점</span>
                    <span className="val fixed-demerit">{profile.nonOffsetDemeritPoints || "0"}</span>
                  </PointBox>
                </PointBadgeRow>
              </ProfileCard>
            ) : (
              <EmptyBox>기본 사생정보 데이터가 존재하지 않습니다.</EmptyBox>
            )}

            {/* 2. 하단 7개 탭 네비게이션 */}
            <TabHeader>
              <TabButton
                active={activeTab === "address"}
                onClick={() => setActiveTab("address")}
              >
                <MapPin size={14} />
                주소사항 ({dormInfo.addressList.length})
              </TabButton>
              <TabButton
                active={activeTab === "reward"}
                onClick={() => setActiveTab("reward")}
              >
                <Award size={14} />
                상벌점이력 ({dormInfo.rewardList.length})
              </TabButton>
              <TabButton
                active={activeTab === "inout"}
                onClick={() => setActiveTab("inout")}
              >
                <LogIn size={14} />
                입퇴사이력 ({dormInfo.inOutList.length})
              </TabButton>
              <TabButton
                active={activeTab === "apply"}
                onClick={() => setActiveTab("apply")}
              >
                <ClipboardList size={14} />
                신청이력 ({dormInfo.applyList.length})
              </TabButton>
              <TabButton
                active={activeTab === "payment"}
                onClick={() => setActiveTab("payment")}
              >
                <CreditCard size={14} />
                등록/환불이력 ({dormInfo.paymentList.length})
              </TabButton>
              <TabButton
                active={activeTab === "utility"}
                onClick={() => setActiveTab("utility")}
              >
                <Zap size={14} />
                공공요금 ({dormInfo.utilityList.length})
              </TabButton>
              <TabButton
                active={activeTab === "pledge"}
                onClick={() => setActiveTab("pledge")}
              >
                <FileCheck size={14} />
                입사서약서 {dormInfo.pledge ? "(1)" : "(0)"}
              </TabButton>
            </TabHeader>

            {/* 3. 탭별 상세 내용 */}
            <TabContentContainer>
              {/* 탭 1: 주소사항 */}
              {activeTab === "address" && (
                <div>
                  {dormInfo.addressList.length > 0 ? (
                    <ItemList>
                      {dormInfo.addressList.map((addr: DormitoryAddressItem, idx: number) => (
                        <ItemCard key={idx}>
                          <ItemRow>
                            <span className="label">우편번호</span>
                            <span className="value">{addr.zipCode || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">기본주소</span>
                            <span className="value">{addr.address || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">상세주소</span>
                            <span className="value">{addr.detailedAddress || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">보호자 연락처</span>
                            <span className="value">{addr.guardianPhone || "-"}</span>
                          </ItemRow>
                        </ItemCard>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyBox>등록된 주소사항 내역이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 2: 상벌점이력 */}
              {activeTab === "reward" && (
                <div>
                  {dormInfo.rewardList.length > 0 ? (
                    <ItemList>
                      {dormInfo.rewardList.map((rw: DormitoryRewardItem, idx: number) => {
                        const isDemerit = rw.type.includes("벌점") || parseInt(rw.score, 10) < 0;
                        return (
                          <ItemCard key={idx}>
                            <ItemHeader>
                              <span className={`badge ${isDemerit ? "demerit" : "merit"}`}>
                                {rw.type || (isDemerit ? "벌점" : "상점")} {rw.score}점
                              </span>
                              <span className="date">{rw.imposedDate}</span>
                            </ItemHeader>
                            <ItemRow>
                              <span className="label">상벌점명</span>
                              <span className="value font-medium">{rw.name || "-"}</span>
                            </ItemRow>
                            <ItemRow>
                              <span className="label">사유</span>
                              <span className="value">{rw.reason || "-"}</span>
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
                    <EmptyBox>상벌점 부여 내역이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 3: 입퇴사이력 */}
              {activeTab === "inout" && (
                <div>
                  {dormInfo.inOutList.length > 0 ? (
                    <ItemList>
                      {dormInfo.inOutList.map((io: DormitoryInOutItem, idx: number) => (
                        <ItemCard key={idx}>
                          <ItemHeader>
                            <span className="badge inout">
                              {io.year}년 {io.term}학기 ({io.dormitoryType || "기숙사"})
                            </span>
                            <span className="status">{io.status || "입퇴사이력"}</span>
                          </ItemHeader>
                          <ItemRow>
                            <span className="label">사생번호</span>
                            <span className="value">{io.studentDormNo || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">입사일자</span>
                            <span className="value">{io.checkInDate || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">퇴사일자</span>
                            <span className="value">{io.checkOutDate || "-"}</span>
                          </ItemRow>
                        </ItemCard>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyBox>입퇴사 이력이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 4: 신청이력 */}
              {activeTab === "apply" && (
                <div>
                  {dormInfo.applyList.length > 0 ? (
                    <ItemList>
                      {dormInfo.applyList.map((ap: DormitoryApplyItem, idx: number) => (
                        <ItemCard key={idx}>
                          <ItemHeader>
                            <span className="badge inout">
                              {ap.year}년 {ap.term}학기
                            </span>
                            <span className="status">{ap.passStatus || ap.applyType || "신청"}</span>
                          </ItemHeader>
                          <ItemRow>
                            <span className="label">신청구분</span>
                            <span className="value">{ap.applyType || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">신청일자</span>
                            <span className="value">{ap.applyDate || "-"}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">거주기간</span>
                            <span className="value">
                              {ap.periodStart || "-"} ~ {ap.periodEnd || "-"}
                            </span>
                          </ItemRow>
                        </ItemCard>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyBox>기숙사 신청 이력이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 5: 등록/환불이력 */}
              {activeTab === "payment" && (
                <div>
                  {dormInfo.paymentList.length > 0 ? (
                    <ItemList>
                      {dormInfo.paymentList.map((pm: DormitoryPaymentItem, idx: number) => (
                        <ItemCard key={idx}>
                          <ItemHeader>
                            <span className={`badge ${pm.type.includes("환불") ? "demerit" : "merit"}`}>
                              {pm.type || "등록/환불"}
                            </span>
                            <span className="date">{pm.date}</span>
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
                              {Number(pm.amount).toLocaleString()}원
                            </span>
                          </ItemRow>
                        </ItemCard>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyBox>등록금 및 환불 처리 내역이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 6: 공공요금 부과내역 */}
              {activeTab === "utility" && (
                <div>
                  {dormInfo.utilityList.length > 0 ? (
                    <ItemList>
                      {dormInfo.utilityList.map((ut: DormitoryUtilityItem, idx: number) => (
                        <ItemCard key={idx}>
                          <ItemHeader>
                            <span className="badge inout">사용월: {ut.useMonth}</span>
                            <span className="font-medium">총 {Number(ut.totalFee).toLocaleString()}원</span>
                          </ItemHeader>
                          <ItemRow>
                            <span className="label">전기 (사용량 / 요금)</span>
                            <span className="value">{ut.electricUsage} / {Number(ut.electricFee).toLocaleString()}원</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">수도 (사용량 / 요금)</span>
                            <span className="value">{ut.waterUsage} / {Number(ut.waterFee).toLocaleString()}원</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">온수 / 난방 사용량</span>
                            <span className="value">{ut.hotWaterUsage} / {ut.heatingUsage}</span>
                          </ItemRow>
                          <ItemRow>
                            <span className="label">소계 / 시설분담금</span>
                            <span className="value">
                              {Number(ut.subtotalFee).toLocaleString()}원 / {Number(ut.facilityFee).toLocaleString()}원
                            </span>
                          </ItemRow>
                        </ItemCard>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyBox>공공요금 부과 내역이 없습니다.</EmptyBox>
                  )}
                </div>
              )}

              {/* 탭 7: 입사서약서 */}
              {activeTab === "pledge" && (
                <div>
                  {dormInfo.pledge ? (
                    <ItemCard>
                      <ItemHeader>
                        <span className="badge merit">입사서약서</span>
                        {dormInfo.pledge.consentDate && (
                          <span className="date">동의일: {dormInfo.pledge.consentDate}</span>
                        )}
                      </ItemHeader>
                      <ItemRow>
                        <span className="label">동의여부</span>
                        <span className="value font-medium">{dormInfo.pledge.consentStatus || "동의"}</span>
                      </ItemRow>
                      {dormInfo.pledge.studentInfo && (
                        <ItemRow>
                          <span className="label">학생정보</span>
                          <span className="value">{dormInfo.pledge.studentInfo}</span>
                        </ItemRow>
                      )}
                      {dormInfo.pledge.documentContent && (
                        <PledgeTextBox>
                          {dormInfo.pledge.documentContent}
                        </PledgeTextBox>
                      )}
                    </ItemCard>
                  ) : (
                    <EmptyBox>입사서약서 정보가 존재하지 않습니다.</EmptyBox>
                  )}
                </div>
              )}
            </TabContentContainer>

            {/* 4. 디버그 원시 데이터 토글 */}
            <DebugArea>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                <Code size={14} />
                {showRawJson ? "원시 파싱 데이터 닫기" : "원시 파싱 데이터 보기"}
              </button>
              {showRawJson && (
                <pre className="json-dump">
                  {JSON.stringify(dormInfo, null, 2)}
                </pre>
              )}
            </DebugArea>
          </ContentSection>
        )}

        {isFetched && !dormInfo && !isLoading && (
          <EmptyBox>생활원 사생 정보가 존재하지 않거나 입사 이력이 없습니다.</EmptyBox>
        )}
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

  .badge {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    background-color: #ebf8ff;
    color: #2b6cb0;
    font-weight: 600;
  }
`;

const ProfileCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
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
  padding: 10px 12px;
  border-right: 1px solid #edf2f7;

  &:last-child {
    border-right: none;
  }

  .th {
    font-size: 11px;
    color: #718096;
    margin-bottom: 3px;
  }

  .td {
    font-size: 13px;
    font-weight: 500;
    color: #2d3748;
    word-break: break-all;
  }
`;

const PointBadgeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
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
  padding: 8px 4px;

  .label {
    font-size: 11px;
    color: #718096;
    margin-bottom: 2px;
  }

  .val {
    font-size: 16px;
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

const EmptyBox = styled.div`
  padding: 24px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px dashed #e2e8f0;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
`;

const DebugArea = styled.div`
  margin-top: 8px;

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px 0;

    &:hover {
      color: #64748b;
    }
  }

  .json-dump {
    margin-top: 8px;
    padding: 12px;
    background-color: #1e293b;
    color: #f1f5f9;
    border-radius: 8px;
    font-size: 11px;
    max-height: 250px;
    overflow-y: auto;
  }
`;
