import { describe, it, expect } from "vitest";
import {
  tryLockFriendRequest,
  unlockFriendRequest,
  isFriendRequestLocked,
} from "../friendRequestLock";

describe("friendRequestLock", () => {
  it("같은 요청은 잠금이 풀리기 전까지 다시 잡을 수 없다", () => {
    expect(tryLockFriendRequest(1)).toBe(true);
    expect(tryLockFriendRequest(1)).toBe(false);
    expect(isFriendRequestLocked(1)).toBe(true);
    unlockFriendRequest(1);
    expect(tryLockFriendRequest(1)).toBe(true);
    unlockFriendRequest(1);
  });

  it("다른 요청은 서로 막지 않는다", () => {
    expect(tryLockFriendRequest(2)).toBe(true);
    expect(tryLockFriendRequest(3)).toBe(true);
    unlockFriendRequest(2);
    unlockFriendRequest(3);
  });
});
