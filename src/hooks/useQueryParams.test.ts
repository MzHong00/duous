import { renderHook } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { useQueryParams } from "./useQueryParams";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const setup = (search = "") => {
  const replace = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(search) as unknown as ReturnType<typeof useSearchParams>
  );
  const { result } = renderHook(() => useQueryParams());
  return { result, replace };
};

describe("useQueryParams", () => {
  it("set은 단일 값을 덮어써 router.replace를 호출한다", () => {
    const { result, replace } = setup("filter=all");
    const [, setParams] = result.current;

    setParams.set("filter", "active");

    expect(replace).toHaveBeenCalledWith("?filter=active", { scroll: false });
  });

  it("toggle은 값이 없으면 추가한다", () => {
    const { result, replace } = setup("");
    const [, setParams] = result.current;

    setParams.toggle("tag", "여행");

    expect(replace).toHaveBeenCalledWith("?tag=%EC%97%AC%ED%96%89", { scroll: false });
  });

  it("toggle은 값이 이미 있으면 제거한다", () => {
    const { result, replace } = setup("tag=여행");
    const [, setParams] = result.current;

    setParams.toggle("tag", "여행");

    expect(replace).toHaveBeenCalledWith("?", { scroll: false });
  });

  it("delete는 value 없이 호출하면 해당 name의 모든 값을 제거한다", () => {
    const { result, replace } = setup("filter=active&tag=a&tag=b");
    const [, setParams] = result.current;

    setParams.delete("tag");

    expect(replace).toHaveBeenCalledWith("?filter=active", { scroll: false });
  });
});
