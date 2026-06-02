import { useState, useMemo } from "react";
import styled, { css } from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFriends } from "@/apis/friends";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import CapsuleButton from "@/components/common/CapsuleButton";
import { ChevronDown, User } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";

const getFriendDept = (nickname: string) => {
  const deptMap: Record<string, string> = {
    김유니: "컴퓨터공학부",
    박민서: "생명공학부(나노바이오공학전공)",
    이지원: "미디어커뮤니케이션학과",
    최유리: "도시환경공학부(건설환경공학전공)",
    홍길동: "Global Trade & Service 학부",
  };
  return deptMap[nickname] || "컴퓨터공학부";
};

const getFriendStudentYear = (studentId: string) => {
  if (!studentId) return "23학번";
  if (studentId.length >= 4) {
    return `${studentId.slice(2, 4)}학번`;
  }
  return `${studentId}학번`;
};

const isFriendPublic = (nickname: string) => {
  return nickname === "김유니" || nickname === "박민서";
};

export default function MobileTimeTableCompareSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  const initialIds = useMemo(() => {
    const idsParam = searchParams.get("ids") || "";
    return idsParam.split(",").map(Number).filter(Boolean);
  }, [searchParams]);

  const [selectedIds, setSelectedIds] = useState<number[]>(() => initialIds);
  const [isAsc, setIsAsc] = useState(true);

  useHeader({
    title: "친구 선택",
    hasback: true,
  });

  const { data: friendsRes, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friends = friendsRes?.data || [];

  /* 실시간 이름/학번 검색 필터 */
  const filteredFriends = useMemo(() => {
    let result = friends;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = friends.filter(
        (f) =>
          f.nickname.toLowerCase().includes(term) ||
          f.friendAlias?.toLowerCase().includes(term) ||
          f.studentId.includes(term),
      );
    }

    /* 가나다 이름순 정렬 */
    return [...result].sort((a, b) => {
      const nameA = a.friendAlias || a.nickname;
      const nameB = b.friendAlias || b.nickname;
      return isAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [friends, searchTerm, isAsc]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCompare = () => {
    if (selectedIds.length === 0) return;
    navigate(`${ROUTES.TIMETABLE.COMPARE}?ids=${selectedIds.join(",")}`, { replace: true });
  };

  return (
    <PageWrapper>
      <SearchSection>
        <MobilePillSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={() => {}}
          placeholder="친구 이름 검색"
        />
      </SearchSection>

      <StatusSection>
        <StatusText>
          내 친구 ({friends.length}) ·{" "}
          <HighlightText>{selectedIds.length}명 선택됨</HighlightText>
        </StatusText>
        <SortButton onClick={() => setIsAsc(!isAsc)}>
          <span>이름순</span>
          <ChevronDown size={16} color={"var(--text-secondary)"} />
        </SortButton>
      </StatusSection>

      <ListSection>
        {isLoading ? (
          <EmptyState>로딩 중...</EmptyState>
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => {
            const isSelected = selectedIds.includes(friend.friendId);
            const isPublic = isFriendPublic(friend.nickname);
            const dept = getFriendDept(friend.nickname);
            const year = getFriendStudentYear(friend.studentId);
            const safeFireId = normalizeProfileImageId(
              friend.fireId,
              DEFAULT_PROFILE_IMAGE_ID,
            );

            return (
              <FriendCard
                key={friend.friendId}
                $selected={isSelected}
                onClick={() => toggleSelect(friend.friendId)}
              >
                <CardInner>
                  <ProfileWrapper>
                    <ProfileImage
                      src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
                      alt="Profile"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <DefaultAvatar>
                      <User size={24} color="#D6D1D5" />
                    </DefaultAvatar>
                  </ProfileWrapper>

                  <InfoArea>
                    <FriendName>
                      {friend.friendAlias || friend.nickname}
                    </FriendName>
                    <FriendSub>
                      {year} · {dept}
                    </FriendSub>
                  </InfoArea>

                  <StatusBadge $public={isPublic}>
                    {isPublic ? "공개" : "비공개"}
                  </StatusBadge>
                </CardInner>
              </FriendCard>
            );
          })
        ) : (
          <EmptyState>일치하는 친구가 없습니다.</EmptyState>
        )}
      </ListSection>

      <FixedFooter>
        <CapsuleButton
          variant="primary"
          fullWidth
          disabled={selectedIds.length === 0}
          onClick={handleCompare}
          style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.16)" }}
        >
          시간표 비교하기
        </CapsuleButton>
      </FixedFooter>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px ${MOBILE_PAGE_GUTTER} 120px;
  //min-height: 100vh;
  box-sizing: border-box;
`;

const SearchSection = styled.div`
  margin-bottom: 20px;
`;

const StatusSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
`;

const StatusText = styled.span`
  color: var(--text-tertiary);

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const HighlightText = styled.span`
  color: var(--text-brand);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  color: var(--text-tertiary);

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  &:active {
    opacity: 0.7;
  }
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FriendCard = styled.div<{ $selected: boolean }>`
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid
    ${({ $selected }) =>
      $selected
        ? "var(--interactive-primary-pressed, #3B82F6)"
        : "transparent"};

  &:active {
    transform: scale(0.99);
  }
`;

const CardInner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const ProfileWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  background-color: #eff6ff;
`;

const DefaultAvatar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const InfoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FriendName = styled.span`
  overflow: hidden;
  color: var(--text-primary, #333d4b);
  text-overflow: ellipsis;

  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
`;

const FriendSub = styled.span`
  overflow: hidden;
  color: var(--text-tertiary, #8b95a1);
  text-overflow: ellipsis;

  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const StatusBadge = styled.div<{ $public: boolean }>`
  padding: 6px 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;

  ${({ $public }) =>
    $public
      ? css`
          border: 1px solid var(--border-brand);
          color: var(--interactive-primary);
          background-color: var(--bg-brand);
        `
      : css`
          background-color: var(--bg-muted);
          color: var(--text-tertiary);
        `}
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px ${MOBILE_PAGE_GUTTER}
    calc(24px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, var(--bg-base, white) 85%, transparent);
  z-index: 100;
  max-width: 768px;
  margin: 0 auto;
`;
