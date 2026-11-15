import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import {
  getAlreadyProcessedFriendRequestNotice,
  isFriendRequestAlreadyProcessed,
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

const httpError = (status: number) =>
  new AxiosError("fail", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: {},
  });

describe("isFriendRequestAlreadyProcessed", () => {
  it("409(이미 처리됨)와 404(요청이 사라짐)는 이미 처리된 요청으로 본다", () => {
    expect(isFriendRequestAlreadyProcessed(httpError(409))).toBe(true);
    expect(isFriendRequestAlreadyProcessed(httpError(404))).toBe(true);
  });

  it("그 밖의 오류는 실패로 본다", () => {
    expect(isFriendRequestAlreadyProcessed(httpError(403))).toBe(false);
    expect(isFriendRequestAlreadyProcessed(httpError(500))).toBe(false);
    expect(isFriendRequestAlreadyProcessed(new Error("network"))).toBe(false);
    expect(isFriendRequestAlreadyProcessed(undefined)).toBe(false);
  });
});

describe("getAlreadyProcessedFriendRequestNotice", () => {
  it("409면 이미 수락됐다고 안내하고, 404는 안내하지 않는다", () => {
    expect(getAlreadyProcessedFriendRequestNotice(httpError(409))).toBe(
      "이미 수락된 요청이에요.",
    );
    expect(getAlreadyProcessedFriendRequestNotice(httpError(404))).toBeNull();
    expect(getAlreadyProcessedFriendRequestNotice(httpError(500))).toBeNull();
  });
});
