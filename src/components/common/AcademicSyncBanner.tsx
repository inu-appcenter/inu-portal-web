import { useState } from "react";
import styled from "styled-components";
import useUserStore from "@/stores/useUserStore";
import {
  isMobileAppEnvironment,
  fetchAcademicInfoFromApp,
} from "@/apis/mobileAgentBridge";
import { syncOfficialAcademic, getMembers } from "@/apis/members";
import { findDepartmentCodeByName } from "@/utils/departmentOptions";

export default function AcademicSyncBanner() {
  const { userInfo, setUserInfo } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 학생이 아니거나 이미 학적 인증이 완료되었거나 닫았으면 숨김
  if (
    dismissed ||
    userInfo.id === 0 ||
    userInfo.memberType !== "STUDENT" ||
    userInfo.isAcademicVerified
  ) {
    return null;
  }

  const handleSync = async () => {
    if (loading) return;

    if (!isMobileAppEnvironment()) {
      alert(
        "공식 학적 인증은 인팁 모바일 앱 환경에서만 가능해요. 인팁 앱에서 접속해주세요.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetchAcademicInfoFromApp();
      if (!res.success || !res.data) {
        alert(
          res.errorMessage ||
            "학적 정보를 가져오지 못했어요. 포털 로그인 상태를 확인해주세요.",
        );
        return;
      }

      const scrapedName = res.data.koreanName || "";
      const scrapedDept = res.data.departmentName || "";
      const deptCode = findDepartmentCodeByName(scrapedDept);

      if (!scrapedName) {
        alert("학적 정보에서 성명을 찾을 수 없어요.");
        return;
      }

      await syncOfficialAcademic({
        realName: scrapedName,
        departmentCode: deptCode || undefined,
      });

      const memberRes = await getMembers();
      setUserInfo(memberRes.data);
      alert("공식 학적 인증이 완료되었어요!");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "학적 동기화 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BannerContainer>
      <BannerContent>
        <BannerTitle>공식 학적 미인증 상태예요</BannerTitle>
        <BannerDesc>
          포털 시스템과 동기화하여 학과 커뮤니티와 시간표 기능을 온전히 이용해보세요.
        </BannerDesc>
      </BannerContent>
      <ActionGroup>
        <SyncButton type="button" onClick={handleSync} disabled={loading}>
          {loading ? "인증 중..." : "인증하기"}
        </SyncButton>
        <DismissButton
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="닫기"
        >
          ✕
        </DismissButton>
      </ActionGroup>
    </BannerContainer>
  );
}

const BannerContainer = styled.div`
  width: 100%;
  background-color: var(--brand-subtle, #e8f3ff);
  border-bottom: 1px solid rgba(49, 130, 246, 0.15);
  padding: 12px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: slideDown 0.25s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BannerTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary, #3182f6);
  letter-spacing: -0.2px;
`;

const BannerDesc = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary, #4e5968);
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const SyncButton = styled.button`
  border: none;
  border-radius: 8px;
  background-color: var(--brand-primary, #3182f6);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.96);
  }

  &:disabled {
    background-color: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #8b95a1);
    cursor: not-allowed;
  }
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-caption, #8b95a1);
  cursor: pointer;
  padding: 4px;
`;
