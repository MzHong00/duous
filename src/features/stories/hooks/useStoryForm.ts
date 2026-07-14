"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { authQueries } from "@/features/auth/queries/authQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { toastActions } from "@/stores/useToastStore";
import { storageApi } from "@/api/storage";
import { PATH_COLORS } from "@/constants/theme";
import { getTodayDateString, formatDate } from "@/utils/date";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import {
  useCreateStoryMutation,
  useUpdateStoryMutation,
} from "@/features/stories/queries/storyMutations";
import { resizeImageFile } from "@/utils/imageResize";
import { useResetOnChange } from "@/hooks/useResetOnChange";

import type { LocationPoint } from "@/features/stories/types/story";

/** blob 미리보기 URL이면 메모리 누수 방지를 위해 해제한다 */
const revokeIfBlobUrl = (url: string | undefined) => {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
};

/**
 * 스토리 작성/수정 폼의 모든 상태와 저장 로직을 담당하는 훅.
 * 컴포넌트는 이 훅이 반환하는 상태·핸들러만 사용해 UI 렌더링에 집중한다.
 */
export const useStoryForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");
  const isEditMode = !!storyId; // 수정 모드 여부

  const { data: user } = useQuery(authQueries.user());
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";
  const { data: stories = [], isPending: isStoriesPending } = useQuery(
    storyQueries.list(workspaceId)
  );
  const createStory = useCreateStoryMutation(workspaceId);
  const updateStory = useUpdateStoryMutation(workspaceId);

  // 수정 모드일 때 기존 스토리 참조
  const existingStory = useMemo(
    () => (isEditMode ? stories.find((s) => s.id === storyId) : null),
    [isEditMode, storyId, stories]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(existingStory?.title || "");
  const [description, setDescription] = useState(existingStory?.description || "");
  const [date, setDate] = useState(
    existingStory ? formatDate(existingStory.date, "YYYY-MM-DD") : getTodayDateString()
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(existingStory?.thumbnailUrl); // 서버에 저장된 썸네일 URL
  const [pendingFile, setPendingFile] = useState<File | null>(null); // 업로드 대기 중인 선택 파일
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingStory?.thumbnailUrl); // 화면에 표시할 미리보기 URL
  const [pathColor, setPathColor] = useState<string>(existingStory?.pathColor ?? PATH_COLORS[0]);
  const [path, setPath] = useState<LocationPoint[]>(existingStory?.path || []);
  const [isPathPickerOpen, setIsPathPickerOpen] = useState(false); // 경로 선택 지도 표시 여부
  const [isSaving, setIsSaving] = useState(false);

  // 언마운트 시점에 최신 previewUrl을 참조하기 위한 ref (blob URL 정리용)
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;
  // 진행 중인 이미지 선택 요청을 식별해 오래된 리사이징 결과를 무시하기 위한 토큰
  const imageSelectRequestIdRef = useRef(0);

  /** 컴포넌트 언마운트 시(저장/제거 없이 화면 이탈) 남아있는 blob 미리보기 URL을 해제한다 */
  useEffect(() => {
    return () => revokeIfBlobUrl(previewUrlRef.current);
  }, []);

  // 수정 모드에서 스토리 쿼리 로드가 초기 렌더보다 늦을 수 있어, 로드 완료(existingStory.id 등장) 시 렌더 중 즉시 폼 값을 채운다
  const existingStoryChanged = useResetOnChange(existingStory?.id);
  if (existingStoryChanged && existingStory) {
    setTitle(existingStory.title || "");
    setDescription(existingStory.description || "");
    setDate(formatDate(existingStory.date, "YYYY-MM-DD"));
    setThumbnailUrl(existingStory.thumbnailUrl);
    setPreviewUrl(existingStory.thumbnailUrl);
    setPathColor(existingStory.pathColor ?? PATH_COLORS[0]);
    setPath(existingStory.path || []);
  }

  /** 파일 선택 시 리사이징 후 미리보기 blob URL 생성 (기존 blob은 해제 후 교체) */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // 동일 파일 재선택 시에도 onChange가 발생하도록 초기화

    const requestId = ++imageSelectRequestIdRef.current;
    const resizedFile = await resizeImageFile(file);

    // 리사이징 도중 다른 이미지가 다시 선택되었다면 이 결과는 폐기한다(최신 선택 덮어쓰기 방지)
    if (requestId !== imageSelectRequestIdRef.current) return;

    revokeIfBlobUrl(previewUrlRef.current);
    const blobUrl = URL.createObjectURL(resizedFile);
    setPendingFile(resizedFile);
    setPreviewUrl(blobUrl);
  };

  /** 선택한 이미지 제거 및 blob URL 정리 */
  const handleRemoveImage = () => {
    revokeIfBlobUrl(previewUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 동일 파일 재선택 시에도 onChange가 발생하도록 초기화
    }
    setPendingFile(null);
    setPreviewUrl(undefined);
    setThumbnailUrl(undefined);
  };

  /** 경로 선택 완료 시 경로·색상 반영 후 지도 닫기 */
  const handlePathConfirm = (newPath: LocationPoint[], newColor: string) => {
    setPath(newPath);
    setPathColor(newColor);
    setIsPathPickerOpen(false);
  };

  /** 폼 내용을 서버 뮤테이션으로 저장(실패 시 로컬 스토어로 폴백) */
  const handleSave = async () => {
    if (isSaving) return;
    // 현재 워크스페이스 목록에 없는 storyId(다른 워크스페이스 등)로 조작된 요청은 차단
    if (isEditMode && !isStoriesPending && !existingStory) {
      toastActions.showToast("스토리를 찾을 수 없습니다.", "error");
      return;
    }
    setIsSaving(true);

    try {
      let finalThumbnailUrl = thumbnailUrl;

      if (pendingFile && user) {
        try {
          finalThumbnailUrl = await storageApi.uploadImage(pendingFile, user.id);
        } catch {
          // blob URL은 이 탭에서만 유효해 서버에 영구 저장할 수 없으므로, 업로드 전 썸네일로 되돌린다
          toastActions.showToast(
            "이미지 업로드에 실패했습니다. 사진 없이 저장하거나 다시 시도해주세요.",
            "error"
          );
          return;
        }
      }

      const storyData = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        thumbnailUrl: finalThumbnailUrl,
        path,
        pathColor,
      };

      if (isEditMode && storyId) {
        await updateStory.mutateAsync({ id: storyId, data: storyData });
      } else {
        await createStory.mutateAsync({
          ...storyData,
          userId: user?.id ?? "",
          workspaceId,
        });
      }

      toastActions.showToast(
        isEditMode ? "기억이 수정되었습니다." : "기억이 기록되었습니다.",
        "success"
      );
      router.back();
    } catch {
      toastActions.showToast("저장에 실패했습니다. 잠시 후 다시 시도해주세요.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditMode,
    fileInputRef,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    previewUrl,
    pathColor,
    path,
    setPath,
    isPathPickerOpen,
    setIsPathPickerOpen,
    isSaving,
    handleImageSelect,
    handleRemoveImage,
    handlePathConfirm,
    handleSave,
  };
};
