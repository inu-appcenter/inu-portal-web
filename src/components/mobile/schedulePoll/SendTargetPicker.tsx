import { useMemo, useState, type ReactNode } from "react";
import styled from "styled-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/common/Icon";
import { WizardCheckbox } from "@/components/mobile/timetable/wizard/ui";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import { getPollSendTargets } from "@/apis/schedulePolls";
import { useSharePoll } from "@/hooks/useSchedulePoll";
import type {
  PollShareKind,
  SharePollResponse,
} from "@/types/schedulePolls";
import { getDisplayName, maskStudentId } from "@/utils/displayName";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  getPollErrorCode,
  getPollErrorMessage,
} from "@/utils/schedulePollError";
import { addPollSharedRoomIds } from "@/utils/schedulePollStorage";
import { showToast } from "@/utils/toast";
import {
  DEFAULT_PROFILE_IMAGE_ID,
  normalizeProfileImageId,
} from "@/utils/userInfo";
import { typography } from "@/styles/typography";
import { PollPrimaryButton, PollSecondaryButton } from "./PollUi";

const MAX_TARGETS = 10;
const SEND_TARGETS_QUERY_KEY = ["schedulePoll", "sendTargets"] as const;

type TabId = "ROOM" | "FRIEND";

interface Target {
  /** `room:25` / `friend:205` */
  key: string;
  type: TabId;
  id: number;
  name: string;
  caption: string;
  imageUrl: string;
}

const profileImageUrl = (fireId: number | null | undefined) =>
  `https://portal.inuappcenter.kr/images/profile/${normalizeProfileImageId(fireId, DEFAULT_PROFILE_IMAGE_ID)}`;

interface SendTargetPickerProps {
  pollId: number;
  /** 참여 링크(외부 공유·링크 복사용) */
  linkUrl: string;
  /** 외부 공유에 붙일 문구 */
  shareText: string;
  kind: PollShareKind;
  /** RESULT일 때 필수 */
  resultVersion?: number;
  candidateRank?: number;
  /** 미리 골라 둘 채팅방(시작한 채팅방, 참여 요청 카드를 보낸 방) */
  preselectedRoomIds?: number[];
  onSent: (response: SharePollResponse) => void;
  /** 넘기면 '건너뛰기' 버튼이 생긴다. 건너뛰어도 조율은 유지된다 */
  onSkip?: () => void;
  /** RESULT_STALE처럼 결과를 다시 받아야 하는 오류가 났을 때 */
  onStale?: () => void;
  /** 버튼 영역을 감쌀 틀. 페이지에서는 하단 고정 바, 시트에서는 그대로 둔다 */
  renderFooter: (buttons: ReactNode) => ReactNode;
}

/**
 * 보낼 곳 선택 (PRD FR-073). 조건 설정 다음의 '참여자 초대'이자 결과 공유 화면이다.
 * [채팅방]·[친구] 탭을 오가며 최대 10곳을 고르고, 친구를 고르면 서버가 1:1 채팅방으로 보낸다.
 * 외부 공유(메신저·링크 복사)는 카드 전송 API를 부르지 않고 링크만 내보낸다.
 */
const SendTargetPicker = ({
  pollId,
  linkUrl,
  shareText,
  kind,
  resultVersion,
  candidateRank,
  preselectedRoomIds,
  onSent,
  onSkip,
  onStale,
  renderFooter,
}: SendTargetPickerProps) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("ROOM");
  const [keyword, setKeyword] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    (preselectedRoomIds ?? []).slice(0, MAX_TARGETS).map((id) => `room:${id}`),
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: SEND_TARGETS_QUERY_KEY,
    queryFn: getPollSendTargets,
    staleTime: 0,
  });
  const shareMutation = useSharePoll(pollId);

  // 채팅방은 최근 대화 순, 친구는 이름 순 (PRD 7장)
  const rooms = useMemo<Target[]>(
    () =>
      [...(data?.chatRooms ?? [])]
        .sort((a, b) =>
          (b.lastMessageTime ?? "").localeCompare(a.lastMessageTime ?? ""),
        )
        .map((room) => ({
          key: `room:${room.roomId}`,
          type: "ROOM",
          id: room.roomId,
          name: room.friendAlias || room.title,
          caption: `${room.currentParticipants}명`,
          imageUrl:
            room.thumbnailUrl || profileImageUrl(room.senderProfileImageNumber),
        })),
    [data?.chatRooms],
  );

  const friends = useMemo<Target[]>(
    () =>
      (data?.friends ?? [])
        .map<Target>((friend) => ({
          key: `friend:${friend.friendMemberId}`,
          type: "FRIEND",
          id: friend.friendMemberId,
          name: friend.friendAlias || getDisplayName(friend),
          caption: maskStudentId(friend.studentId),
          imageUrl: profileImageUrl(friend.fireId),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [data?.friends],
  );

  const targetByKey = useMemo(
    () => new Map([...rooms, ...friends].map((target) => [target.key, target])),
    [rooms, friends],
  );
  // 목록에 없는 대상(나간 방 등)은 선택에서 뺀다.
  const selected = selectedKeys
    .map((key) => targetByKey.get(key))
    .filter((target): target is Target => Boolean(target));

  const normalizedKeyword = keyword.trim().toLowerCase();
  const visible = (tab === "ROOM" ? rooms : friends).filter(
    (target) =>
      !normalizedKeyword ||
      target.name.toLowerCase().includes(normalizedKeyword) ||
      target.caption.includes(normalizedKeyword),
  );

  const toggle = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys((prev) => prev.filter((k) => k !== key));
      return;
    }
    if (selected.length >= MAX_TARGETS) {
      showToast(`한 번에 ${MAX_TARGETS}곳까지 보낼 수 있어요`);
      return;
    }
    setSelectedKeys((prev) => [...prev, key]);
  };

  const trackExternal = (external: "SHARE_SHEET" | "COPY_LINK") =>
    mixpanelTrack.pollShare({
      pollId,
      kind,
      version: resultVersion ?? null,
      chatRoomCount: 0,
      friendCount: 0,
      external,
    });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      showToast("링크를 복사했어요");
      trackExternal("COPY_LINK");
    } catch {
      showToast("링크를 복사하지 못했어요");
    }
  };

  // 앱에서는 navigator.share가 네이티브 공유 시트로 위임된다(utils/nativeShare).
  // Web Share API가 없는 브라우저는 링크 복사로 대체한다.
  const handleExternalShare = async () => {
    if (typeof navigator.share !== "function") {
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({ title: shareText, text: shareText, url: linkUrl });
      trackExternal("SHARE_SHEET");
    } catch (error) {
      // 사용자가 공유 시트를 닫은 것은 오류가 아니다.
      if ((error as { name?: string } | null)?.name !== "AbortError") {
        await handleCopyLink();
      }
    }
  };

  const handleSend = () => {
    if (selected.length === 0 || shareMutation.isPending) return;
    const chatRoomIds = selected.filter((t) => t.type === "ROOM").map((t) => t.id);
    const friendMemberIds = selected
      .filter((t) => t.type === "FRIEND")
      .map((t) => t.id);

    shareMutation.mutate(
      {
        kind,
        ...(kind === "RESULT" ? { resultVersion, candidateRank } : {}),
        chatRoomIds,
        friendMemberIds,
      },
      {
        onSuccess: (response) => {
          addPollSharedRoomIds(
            pollId,
            response.results.map((result) => result.chatRoomId),
          );
          mixpanelTrack.pollShare({
            pollId,
            kind,
            version: resultVersion ?? null,
            chatRoomCount: chatRoomIds.length,
            friendCount: friendMemberIds.length,
          });
          onSent(response);
        },
        onError: (error) => {
          const code = getPollErrorCode(error);
          if (code === "NOT_SHARE_TARGET") {
            void queryClient.invalidateQueries({
              queryKey: SEND_TARGETS_QUERY_KEY,
            });
          }
          if (code === "RESULT_STALE") onStale?.();
          showToast(
            getPollErrorMessage(error, "보내지 못했어요"),
            // 코드가 없는 실패(네트워크 등)만 같은 요청을 다시 보낼 수 있다.
            code ? undefined : { action: { text: "다시 시도", onClick: handleSend } },
          );
        },
      },
    );
  };

  return (
    <Wrapper>
      <ExternalRow>
        <ExternalButton type="button" onClick={handleExternalShare}>
          <Icon name="share" size={18} />
          <span>공유하기</span>
        </ExternalButton>
        <ExternalButton type="button" onClick={handleCopyLink}>
          <Icon name="link-angled" size={18} />
          <span>링크 복사</span>
        </ExternalButton>
      </ExternalRow>

      <SearchField>
        <Icon name="search" size={20} />
        <input
          type="search"
          value={keyword}
          placeholder="이름, 학번으로 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
      </SearchField>

      <CountRow>
        <strong>{selected.length}</strong>/{MAX_TARGETS}곳 선택
      </CountRow>

      {selected.length > 0 && (
        <Chips>
          {selected.map((target) => (
            <ChipButton
              key={target.key}
              type="button"
              aria-label={`${target.name} 선택 해제`}
              onClick={() => toggle(target.key)}
            >
              <ChipAvatar>
                <img src={target.imageUrl} alt="" />
                <RemoveBadge aria-hidden>
                  <Icon name="close-md" size={10} />
                </RemoveBadge>
              </ChipAvatar>
              <ChipName>{target.name}</ChipName>
            </ChipButton>
          ))}
        </Chips>
      )}

      <Tabs role="tablist">
        {(
          [
            ["ROOM", "채팅방"],
            ["FRIEND", "친구"],
          ] as const
        ).map(([id, label]) => (
          <Tab
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            $active={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </Tab>
        ))}
      </Tabs>

      <List>
        {isLoading ? (
          <Empty>목록을 불러오는 중이에요</Empty>
        ) : isError ? (
          <Empty>
            목록을 불러오지 못했어요
            <InlineButton type="button" onClick={() => refetch()}>
              다시 시도
            </InlineButton>
          </Empty>
        ) : visible.length === 0 ? (
          tab === "FRIEND" && friends.length === 0 ? (
            // 친구 보유율이 낮아 기본 상태에 가깝다. 목록 대신 링크 초대를 앞세운다.
            <Empty>
              아직 친구가 없어요
              <span>링크를 보내면 친구가 아니어도 바로 참여할 수 있어요</span>
              <InviteLinkButton type="button" onClick={handleExternalShare}>
                링크로 초대하기
              </InviteLinkButton>
            </Empty>
          ) : (
            <Empty>
              {normalizedKeyword
                ? "검색 결과가 없어요"
                : tab === "ROOM"
                  ? "참여 중인 채팅방이 없어요"
                  : "보낼 수 있는 친구가 없어요"}
            </Empty>
          )
        ) : (
          visible.map((target) => {
            const checked = selectedKeys.includes(target.key);
            return (
              <Row
                key={target.key}
                type="button"
                role="checkbox"
                aria-checked={checked}
                $checked={checked}
                onClick={() => toggle(target.key)}
              >
                <RowAvatar src={target.imageUrl} alt="" />
                <RowText>
                  <RowName>{target.name}</RowName>
                  {target.caption && <RowCaption>{target.caption}</RowCaption>}
                </RowText>
                <WizardCheckbox checked={checked} />
              </Row>
            );
          })
        )}
      </List>

      {renderFooter(
        <>
          {onSkip && (
            <PollSecondaryButton
              type="button"
              disabled={shareMutation.isPending}
              onClick={onSkip}
            >
              건너뛰기
            </PollSecondaryButton>
          )}
          <PollPrimaryButton
            type="button"
            disabled={selected.length === 0 || shareMutation.isPending}
            onClick={handleSend}
          >
            {shareMutation.isPending
              ? "보내는 중…"
              : selected.length > 0
                ? `보내기 (${selected.length}곳)`
                : "보내기"}
          </PollPrimaryButton>
        </>,
      )}
    </Wrapper>
  );
};

export default SendTargetPicker;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;

const ExternalRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ExternalButton = styled.button`
  ${buttonReset}
  flex: 1 0 0;
  min-width: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-secondary);
  white-space: nowrap;
  ${typography.label2}

  &:active {
    background: var(--bg-muted);
  }
`;

const SearchField = styled.label`
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-tertiary);

  input {
    flex: 1 0 0;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-primary);
    /* iOS는 16px 미만 입력에 포커스하면 화면을 확대한다 */
    font-size: 16px;

    &::placeholder {
      color: var(--text-tertiary);
    }
  }
`;

const CountRow = styled.div`
  padding: 0 8px;
  color: var(--text-secondary);
  ${typography.label2}

  strong {
    margin-right: 2px;
    color: var(--text-brand);
    font-weight: inherit;
  }
`;

const Chips = styled.div`
  display: flex;
  gap: 16px;
  padding: 4px 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChipButton = styled.button`
  ${buttonReset}
  flex-shrink: 0;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ChipAvatar = styled.span`
  position: relative;
  width: 48px;
  height: 48px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: var(--bg-brand);
  }
`;

const RemoveBadge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--text-tertiary);
  color: var(--text-inverse);
`;

const ChipName = styled.span`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  text-align: center;
  ${typography.caption1}
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border-default);
`;

const Tab = styled.button<{ $active: boolean }>`
  ${buttonReset}
  flex: 1 0 0;
  height: 40px;
  margin-bottom: -1px;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "var(--border-brand)" : "transparent")};
  color: ${({ $active }) =>
    $active ? "var(--text-brand)" : "var(--text-tertiary)"};
  ${typography.heading3}
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  overflow: hidden;
`;

const Row = styled.button<{ $checked: boolean }>`
  ${buttonReset}
  min-height: 72px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  background: ${({ $checked }) =>
    $checked ? "var(--bg-brand)" : "transparent"};

  & + & {
    border-top: 1px solid var(--border-default);
  }
`;

const RowAvatar = styled.img`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-brand);
`;

const RowText = styled.span`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const RowName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  ${typography.heading2}
`;

const RowCaption = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const Empty = styled.div`
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-align: center;
  ${typography.label2}

  span {
    color: var(--text-tertiary);
    ${typography.caption1}
  }
`;

const InlineButton = styled.button`
  ${buttonReset}
  color: var(--text-brand);
  ${typography.label2}
`;

const InviteLinkButton = styled.button`
  ${buttonReset}
  margin-top: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 999px;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  ${typography.heading3}
`;
