import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatMessage } from "@/types/chat";

const { getChatMessages, getPreviousMessages } = vi.hoisted(() => ({
  getChatMessages: vi.fn(),
  getPreviousMessages: vi.fn(),
}));

vi.mock("../../../apis/chat", () => ({ getChatMessages, getPreviousMessages }));

const {
  PAGE_SIZE,
  fetchRoomSnapshot,
  mergeMessages,
  newestMessageId,
  oldestMessageId,
} = await import("../messageSync");

/**
 * 실제 messageId는 18자리 스노우플레이크 문자열이다.
 * Number로 바꾸면 하위 자릿수가 잘리는 크기라 테스트도 같은 크기를 쓴다.
 */
const SNOWFLAKE_BASE = 879914103792963000n;

const idAt = (offset: number) => String(SNOWFLAKE_BASE + BigInt(offset));

const msg = (offset: number, extra: Partial<ChatMessage> = {}) =>
  ({
    messageId: idAt(offset),
    roomId: "1",
    content: `m${offset}`,
    unreadCount: 1,
    createDate: "2026-08-25T00:00:00Z",
    ...extra,
  }) as ChatMessage;

/** id가 연속인 페이지를 만든다. (끝 값 포함) */
const page = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => msg(from + i));

describe("mergeMessages", () => {
  it("messageId 오름차순으로 정규화한다", () => {
    expect(
      mergeMessages([msg(3), msg(1)], [msg(2)]).map((m) => m.messageId),
    ).toEqual([idAt(1), idAt(2), idAt(3)]);
  });

  it("같은 messageId는 중복으로 쌓지 않고 최신 내용으로 덮는다", () => {
    const merged = mergeMessages([msg(1, { unreadCount: 2 })], [
      msg(1, { unreadCount: 0 }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].unreadCount).toBe(0);
  });

  it("소켓 payload에 없는 필드는 기존 값을 보존한다", () => {
    const known = msg(1, { senderChatRoomMemberId: 77 });
    const fromSocket = { messageId: idAt(1), content: "m1" } as ChatMessage;

    expect(mergeMessages([known], [fromSocket]).at(0)).toMatchObject({
      messageId: idAt(1),
      senderChatRoomMemberId: 77,
    });
  });

  it("기존 목록을 덮어쓰지 않는다 (무한스크롤로 불러온 과거 메시지 보존)", () => {
    const history = [msg(1), msg(2), msg(3)];

    expect(
      mergeMessages(history, [msg(4)]).map((m) => m.messageId),
    ).toEqual([idAt(1), idAt(2), idAt(3), idAt(4)]);
  });

  it("18자리 스노우플레이크 id를 정밀도 손실 없이 구분·정렬한다", () => {
    // Number로 바꾸면 세 id가 모두 879914103792963000이 되어 하나로 뭉개진다.
    const ids = [idAt(1), idAt(2), idAt(3)];
    expect(new Set(ids.map(Number)).size).toBe(1); // 문제 상황 확인
    expect(new Set(ids).size).toBe(3);

    const merged = mergeMessages([], [msg(3), msg(1), msg(2)]);

    expect(merged.map((m) => m.messageId)).toEqual(ids);
  });

  it("messageId가 문자열이어도 걸러내지 않는다", () => {
    // 이 가드가 typeof === "number"였을 때 목록 전체가 비어버렸다.
    expect(mergeMessages([], [msg(1), msg(2)])).toHaveLength(2);
  });

  it("바뀐 내용이 없으면 같은 배열 참조를 돌려준다", () => {
    const prev = [msg(1), msg(2)];

    expect(mergeMessages(prev, [msg(2)])).toBe(prev);
    expect(mergeMessages(prev, [])).toBe(prev);
  });
});

describe("oldestMessageId / newestMessageId", () => {
  it("빈 목록에서는 null이다", () => {
    expect(oldestMessageId([])).toBeNull();
    expect(newestMessageId([])).toBeNull();
  });

  it("정렬 여부와 무관하게 양 끝을 찾는다", () => {
    const list = [msg(5), msg(1), msg(9)];

    expect(oldestMessageId(list)).toBe(idAt(1));
    expect(newestMessageId(list)).toBe(idAt(9));
  });
});

describe("fetchRoomSnapshot", () => {
  beforeEach(() => {
    getChatMessages.mockReset();
    getPreviousMessages.mockReset();
  });

  it("최신 페이지가 이미 아는 지점과 이어지면 추가 요청을 하지 않는다", async () => {
    getChatMessages.mockResolvedValue({ data: { messages: page(10, 20) } });

    const snapshot = await fetchRoomSnapshot("1", idAt(15));

    expect(getPreviousMessages).not.toHaveBeenCalled();
    expect(snapshot?.messages).toHaveLength(11);
  });

  it("끊긴 동안 한 페이지 넘게 쌓였으면 이미 아는 구간과 겹칠 때까지 거슬러 올라간다", async () => {
    // 알고 있는 최신 = 100, 서버 최신 페이지 = 141~160 → 101~140이 구멍.
    // messageId가 연속이라는 보장이 없으므로 "실제로 겹치는" 페이지를 받을
    // 때까지 멈추지 않는다. 마지막 81~100 페이지가 100을 포함해 겹친다.
    getChatMessages.mockResolvedValue({ data: { messages: page(141, 160) } });
    getPreviousMessages
      .mockResolvedValueOnce(page(121, 140))
      .mockResolvedValueOnce(page(101, 120))
      .mockResolvedValueOnce(page(81, 100));

    const snapshot = await fetchRoomSnapshot("1", idAt(100));

    expect(getPreviousMessages.mock.calls).toEqual([
      ["1", idAt(141)],
      ["1", idAt(121)],
      ["1", idAt(101)],
    ]);
    // 구멍(101~140)이 빠짐없이 메워졌다.
    expect(snapshot?.messages.map((m) => m.messageId)).toEqual(
      page(81, 160).map((m) => m.messageId),
    );
  });

  it("계속 겹치지 않아도 정해진 페이지 수에서 멈춘다", async () => {
    // 항상 꽉 찬 페이지를 주지만 아는 지점과는 영영 겹치지 않는 응답
    let next = 1_000;
    getChatMessages.mockResolvedValue({ data: { messages: page(next, next + 19) } });
    getPreviousMessages.mockImplementation(() => {
      next -= 20;
      return Promise.resolve(page(next, next + 19));
    });

    await fetchRoomSnapshot("1", idAt(1));

    expect(getPreviousMessages).toHaveBeenCalledTimes(10);
  });

  it("페이지가 덜 찬 응답을 만나면 더 거슬러 올라가지 않는다", async () => {
    getChatMessages.mockResolvedValue({ data: { messages: page(141, 160) } });
    getPreviousMessages.mockResolvedValue(page(138, 140)); // PAGE_SIZE 미만

    await fetchRoomSnapshot("1", idAt(100));

    expect(PAGE_SIZE).toBe(20);
    expect(getPreviousMessages).toHaveBeenCalledTimes(1);
  });

  it("아는 메시지가 없는 최초 로드에서는 갭 필을 돌지 않는다", async () => {
    getChatMessages.mockResolvedValue({ data: { messages: page(141, 160) } });

    await fetchRoomSnapshot("1", null);

    expect(getPreviousMessages).not.toHaveBeenCalled();
  });

  it("중간에 중단되면 null을 반환한다", async () => {
    getChatMessages.mockResolvedValue({ data: { messages: page(141, 160) } });

    expect(await fetchRoomSnapshot("1", idAt(100), () => true)).toBeNull();
    expect(getPreviousMessages).not.toHaveBeenCalled();
  });

  it("방 정보와 myHash를 함께 돌려준다", async () => {
    getChatMessages.mockResolvedValue({
      data: { id: 1, myHash: "abc", messages: page(1, 3) },
    });

    const snapshot = await fetchRoomSnapshot("1", null);

    expect(snapshot?.room?.myHash).toBe("abc");
  });
});
