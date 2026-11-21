import { describe, it, expect, vi, beforeEach } from "vitest";

const { post, del } = vi.hoisted(() => ({ post: vi.fn(), del: vi.fn() }));
vi.mock("../tokenInstance", () => ({ default: { post, delete: del } }));

import {
  cancelFriendRequest,
  deleteFriend,
  rejectFriendRequest,
} from "../friends";

describe("친구 요청 거절·취소 API", () => {
  beforeEach(() => {
    post.mockReset().mockResolvedValue({ data: { data: null, msg: "" } });
    del.mockReset().mockResolvedValue({ data: { data: null, msg: "" } });
  });

  it("거절은 DELETE가 아닌 POST /reject로 보낸다", async () => {
    await rejectFriendRequest(7);
    expect(post).toHaveBeenCalledWith("/api/friends/7/reject");
    expect(del).not.toHaveBeenCalled();
  });

  it("취소는 DELETE가 아닌 POST /cancel로 보낸다", async () => {
    await cancelFriendRequest(8);
    expect(post).toHaveBeenCalledWith("/api/friends/8/cancel");
    expect(del).not.toHaveBeenCalled();
  });

  it("친구 삭제는 계속 DELETE를 쓴다", async () => {
    await deleteFriend(9);
    expect(del).toHaveBeenCalledWith("/api/friends/9");
  });
});
