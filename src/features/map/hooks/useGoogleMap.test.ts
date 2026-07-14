import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useJsApiLoader } from "@react-google-maps/api";
import { ENV } from "@/constants/config";
import { useGoogleMap } from "./useGoogleMap";

vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: vi.fn(),
}));

vi.mock("@/constants/config", () => ({
  ENV: {
    GOOGLE_MAPS_API_KEY: "",
  },
}));

/** useJsApiLoader mock의 반환값(isLoaded/loadError)을 지정한다. */
const mockJsApiLoader = (isLoaded: boolean, loadError: Error | undefined) => {
  vi.mocked(useJsApiLoader).mockReturnValue({
    isLoaded,
    loadError,
  } as unknown as ReturnType<typeof useJsApiLoader>);
};

describe("useGoogleMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("API 키가 없으면 status가 missing-key다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "";
    mockJsApiLoader(false, undefined);

    const { result } = renderHook(() => useGoogleMap());

    expect(result.current.status).toBe("missing-key");
  });

  it("API 키가 placeholder 값이면 status가 missing-key다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "your_google_maps_api_key_here";
    mockJsApiLoader(false, undefined);

    const { result } = renderHook(() => useGoogleMap());

    expect(result.current.status).toBe("missing-key");
  });

  it("로드 에러가 발생하면 status가 error이고 메시지를 반환한다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "valid-key";
    mockJsApiLoader(false, new Error("load failed"));

    const { result } = renderHook(() => useGoogleMap());

    expect(result.current.status).toBe("error");
    expect(result.current.loadErrorMessage).toBe("load failed");
  });

  it("키가 유효하고 아직 로드되지 않았으면 status가 loading이다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "valid-key";
    mockJsApiLoader(false, undefined);

    const { result } = renderHook(() => useGoogleMap());

    expect(result.current.status).toBe("loading");
    expect(result.current.loadErrorMessage).toBeNull();
  });

  it("로드가 완료되면 status가 ready다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "valid-key";
    mockJsApiLoader(true, undefined);

    const { result } = renderHook(() => useGoogleMap());

    expect(result.current.status).toBe("ready");
  });

  it("onMapLoad 호출 시 mapRef에 Map 인스턴스를 저장한다", () => {
    (ENV as { GOOGLE_MAPS_API_KEY: string }).GOOGLE_MAPS_API_KEY = "valid-key";
    mockJsApiLoader(true, undefined);

    const { result } = renderHook(() => useGoogleMap());
    const fakeMap = { id: "fake-map" } as unknown as google.maps.Map;

    act(() => {
      result.current.onMapLoad(fakeMap);
    });

    expect(result.current.mapRef.current).toBe(fakeMap);
  });
});
