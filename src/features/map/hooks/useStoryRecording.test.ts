import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCreateStoryMutation } from "@/features/stories/queries/storyMutations";
import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { toastActions } from "@/stores/useToastStore";
import { DEFAULT_CENTER } from "@/features/map/constants/mapConfig";
import { useStoryRecording } from "./useStoryRecording";

import type { LocationPoint } from "@/features/stories/types/story";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/features/stories/queries/storyMutations", () => ({
  useCreateStoryMutation: vi.fn(),
}));

vi.mock("@/stores/useToastStore", () => ({
  toastActions: {
    showToast: vi.fn(),
  },
}));

vi.mock("@/features/stories/stores/useStoryStore", () => ({
  useStoryStore: vi.fn(),
  storyActions: {
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    setSelectedStoryId: vi.fn(),
    addLocationPoint: vi.fn(),
    clearRecording: vi.fn(),
  },
}));

const WORKSPACE_ID = "ws-1";
const USER_ID = "user-1";

/** 테스트마다 isRecording/recordingPath 값을 지정해 useStoryStore mock을 설정한다. */
const mockStoryStoreState = (isRecording: boolean, recordingPath: LocationPoint[]) => {
  const mockedUseStoryStore = useStoryStore as unknown as ReturnType<typeof vi.fn>;
  mockedUseStoryStore.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({
      isRecording,
      recordingPath,
      selectedStoryId: null,
    })
  );
};

/** navigator.geolocation을 스텁하기 위한 헬퍼. watchPosition 콜백을 즉시 캡처해 테스트에서 수동 호출한다. */
const stubGeolocation = () => {
  const watchPosition = vi.fn(() => 1);
  const clearWatch = vi.fn();
  const getCurrentPosition = vi.fn((success: PositionCallback) => {
    success({
      coords: { latitude: 10, longitude: 20 },
      timestamp: 1000,
    } as GeolocationPosition);
  });
  vi.stubGlobal("navigator", {
    geolocation: { watchPosition, clearWatch, getCurrentPosition },
  });
  return { watchPosition, clearWatch, getCurrentPosition };
};

describe("useStoryRecording", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockStoryStoreState(false, []);
    vi.mocked(useCreateStoryMutation).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useCreateStoryMutation>);
  });

  it("마운트 시 getCurrentPosition으로 현재 위치를 조회해 myLocation을 갱신한다", async () => {
    stubGeolocation();

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    await waitFor(() => {
      expect(result.current.myLocation).toEqual({ lat: 10, lng: 20 });
    });
  });

  it("geolocation을 사용할 수 없으면 myLocation이 기본값으로 유지된다", () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    expect(result.current.myLocation).toEqual(DEFAULT_CENTER);
  });

  it("getCurrentPosition 실패 시 myLocation을 기본값으로 되돌린다", async () => {
    const getCurrentPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({} as GeolocationPositionError);
    });
    vi.stubGlobal("navigator", {
      geolocation: { getCurrentPosition, watchPosition: vi.fn(), clearWatch: vi.fn() },
    });

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    await waitFor(() => {
      expect(result.current.myLocation).toEqual(DEFAULT_CENTER);
    });
  });

  it("toggleRecording 최초 호출 시 기록을 시작하고 안내 토스트를 띄운다", () => {
    const { watchPosition } = stubGeolocation();

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    act(() => {
      result.current.toggleRecording();
    });

    expect(storyActions.startRecording).toHaveBeenCalled();
    expect(watchPosition).toHaveBeenCalled();
    expect(toastActions.showToast).toHaveBeenCalledWith("실시간 위치 기록을 시작합니다.", "info");
  });

  it("watchPosition 콜백이 위치를 받으면 addLocationPoint를 호출하고 myLocation을 갱신한다", () => {
    const watchPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: { latitude: 30, longitude: 40 },
        timestamp: 2000,
      } as GeolocationPosition);
      return 1;
    });
    vi.stubGlobal("navigator", {
      geolocation: { watchPosition, clearWatch: vi.fn(), getCurrentPosition: vi.fn() },
    });

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    act(() => {
      result.current.toggleRecording();
    });

    expect(result.current.myLocation).toEqual({ lat: 30, lng: 40 });
    expect(storyActions.addLocationPoint).toHaveBeenCalledWith({
      latitude: 30,
      longitude: 40,
      timestamp: 2000,
    });
  });

  it("watchPosition 에러가 PERMISSION_DENIED이면 권한 에러 토스트를 띄우고 기록을 중단한다", () => {
    const watchPosition = vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, PERMISSION_DENIED: 1 } as unknown as GeolocationPositionError);
      return 1;
    });
    vi.stubGlobal("navigator", {
      geolocation: { watchPosition, clearWatch: vi.fn(), getCurrentPosition: vi.fn() },
    });

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    act(() => {
      result.current.toggleRecording();
    });

    expect(toastActions.showToast).toHaveBeenCalledWith(
      "위치 권한이 필요합니다. 설정에서 허용해주세요.",
      "error"
    );
    expect(storyActions.stopRecording).toHaveBeenCalled();
  });

  it("geolocation을 지원하지 않으면 지원 불가 토스트를 띄운다", () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    act(() => {
      result.current.toggleRecording();
    });

    expect(toastActions.showToast).toHaveBeenCalledWith(
      "이 기기에서는 위치 기록을 지원하지 않습니다.",
      "error"
    );
  });

  it("기록 종료 시 경로 포인트가 부족하면 에러 토스트를 띄우고 기록을 중단한다", () => {
    const { clearWatch } = stubGeolocation();
    mockStoryStoreState(true, [{ latitude: 1, longitude: 1, timestamp: 1 }]);

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    act(() => {
      result.current.toggleRecording();
    });

    expect(clearWatch).toHaveBeenCalled();
    expect(toastActions.showToast).toHaveBeenCalledWith(
      "기록된 경로가 너무 짧아 저장할 수 없습니다.",
      "error"
    );
    expect(storyActions.stopRecording).toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("기록 종료 시 경로가 충분하면 스토리를 저장하고 편집 페이지로 이동한다", async () => {
    stubGeolocation();
    const recordingPath = [
      { latitude: 1, longitude: 1, timestamp: 1 },
      { latitude: 2, longitude: 2, timestamp: 2 },
    ];
    mockStoryStoreState(true, recordingPath);
    mutateAsync.mockResolvedValue({ id: "story-1" });

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    await act(async () => {
      await result.current.toggleRecording();
    });

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID, workspaceId: WORKSPACE_ID, path: recordingPath })
    );
    expect(storyActions.clearRecording).toHaveBeenCalled();
    expect(toastActions.showToast).toHaveBeenCalledWith(
      "새로운 스토리가 기록되었습니다!",
      "success"
    );
    expect(pushMock).toHaveBeenCalled();
  });

  it("스토리 저장에 실패하면 에러 토스트를 띄우고 기록을 중단한다", async () => {
    stubGeolocation();
    mockStoryStoreState(true, [
      { latitude: 1, longitude: 1, timestamp: 1 },
      { latitude: 2, longitude: 2, timestamp: 2 },
    ]);
    mutateAsync.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useStoryRecording({ workspaceId: WORKSPACE_ID, userId: USER_ID })
    );

    await act(async () => {
      await result.current.toggleRecording();
    });

    expect(toastActions.showToast).toHaveBeenCalledWith(
      "스토리 저장에 실패했습니다. 다시 시도해주세요.",
      "error"
    );
    expect(storyActions.stopRecording).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
