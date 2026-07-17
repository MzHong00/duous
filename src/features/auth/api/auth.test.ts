import { beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/features/auth/api/auth";

const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authApi.signInWithGoogle", () => {
  it("google provider와 콜백 URL로 OAuth 로그인을 요청한다", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    await authApi.signInWithGoogle();

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: expect.stringContaining("/auth/callback"),
        scopes: "openid email profile",
      },
    });
  });

  it("redirectPath가 있으면 콜백 URL에 redirect 쿼리를 포함한다", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    await authApi.signInWithGoogle("/home");

    const callArgs = mockSignInWithOAuth.mock.calls[0][0] as { options: { redirectTo: string } };
    expect(callArgs.options.redirectTo).toContain("redirect=%2Fhome");
  });

  it("로그인 실패 시 에러를 throw한다", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: new Error("oauth failed") });

    await expect(authApi.signInWithGoogle()).rejects.toThrow("구글 로그인에 실패했습니다.");
  });
});

describe("authApi.signOut", () => {
  it("로그아웃을 요청한다", async () => {
    mockSignOut.mockResolvedValueOnce({ error: null });

    await authApi.signOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("로그아웃 실패 시 에러를 throw한다", async () => {
    mockSignOut.mockResolvedValueOnce({ error: new Error("signout failed") });

    await expect(authApi.signOut()).rejects.toThrow("로그아웃에 실패했습니다.");
  });
});

describe("authApi.getSession", () => {
  it("세션을 반환한다", async () => {
    const session = { access_token: "token" };
    mockGetSession.mockResolvedValueOnce({ data: { session }, error: null });

    const result = await authApi.getSession();

    expect(result).toBe(session);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error("session failed"),
    });

    await expect(authApi.getSession()).rejects.toThrow("세션 조회에 실패했습니다.");
  });
});

describe("authApi.getUser", () => {
  it("user_metadata의 이름/이메일/프로필이미지로 User를 구성한다", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          user_metadata: { full_name: "홍길동", avatar_url: "https://example.com/avatar.png" },
        },
      },
      error: null,
    });

    const result = await authApi.getUser();

    expect(result).toEqual({
      id: "user-1",
      name: "홍길동",
      email: "test@example.com",
      profileImage: "https://example.com/avatar.png",
    });
  });

  it("이름이 없으면 이메일 아이디 부분을 이름으로 사용한다", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: { id: "user-1", email: "test@example.com", user_metadata: {} },
      },
      error: null,
    });

    const result = await authApi.getUser();

    expect(result?.name).toBe("test");
  });

  it("이름과 이메일이 모두 없으면 기본 이름을 사용한다", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: {
        user: { id: "user-1", email: undefined, user_metadata: {} },
      },
      error: null,
    });

    const result = await authApi.getUser();

    expect(result?.name).toBe("사용자");
  });

  it("에러가 있으면 null을 반환한다", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("get user failed"),
    });

    const result = await authApi.getUser();

    expect(result).toBeNull();
  });

  it("user가 없으면 null을 반환한다", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const result = await authApi.getUser();

    expect(result).toBeNull();
  });
});

describe("authApi.updateProfile", () => {
  it("name과 profileImage를 full_name/avatar_url로 변환해 업데이트한다", async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null });

    await authApi.updateProfile({ name: "새이름", profileImage: "https://example.com/new.png" });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      data: { full_name: "새이름", avatar_url: "https://example.com/new.png" },
    });
  });

  it("전달되지 않은 필드는 data에서 제외한다", async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: null });

    await authApi.updateProfile({ name: "새이름" });

    expect(mockUpdateUser).toHaveBeenCalledWith({ data: { full_name: "새이름" } });
  });

  it("업데이트 실패 시 에러를 throw한다", async () => {
    mockUpdateUser.mockResolvedValueOnce({ error: new Error("update failed") });

    await expect(authApi.updateProfile({ name: "새이름" })).rejects.toThrow(
      "프로필 수정에 실패했습니다."
    );
  });
});
