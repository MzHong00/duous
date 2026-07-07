"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { authQueries } from "@/features/auth/queries/authQueries";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { storageApi } from "@/api/storage";
import { PATH_COLORS } from "@/constants/theme";
import { getTodayDateString, formatDate } from "@/utils/date";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import {
  useCreateStoryMutation,
  useUpdateStoryMutation,
} from "@/features/stories/queries/storyMutations";

import type { LocationPoint } from "@/features/stories/types/story";

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
  const { data: stories = [] } = useQuery(storyQueries.list(workspaceId));
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

  /** 수정 모드에서 스토리 쿼리 로드가 초기 렌더보다 늦을 수 있어, 로드 완료 시 폼 값을 채운다 */
  useEffect(() => {
    if (!existingStory) return;
    setTitle(existingStory.title || "");
    setDescription(existingStory.description || "");
    setDate(formatDate(existingStory.date, "YYYY-MM-DD"));
    setThumbnailUrl(existingStory.thumbnailUrl);
    setPreviewUrl(existingStory.thumbnailUrl);
    setPathColor(existingStory.pathColor ?? PATH_COLORS[0]);
    setPath(existingStory.path || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStory?.id]);

  /** 파일 선택 시 미리보기 blob URL 생성 */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(blobUrl);
  };

  /** 선택한 이미지 제거 및 blob URL 정리 */
  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
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
    setIsSaving(true);

    try {
      let finalThumbnailUrl = thumbnailUrl;

      if (pendingFile && user) {
        try {
          finalThumbnailUrl = await storageApi.uploadImage(pendingFile, user.id);
        } catch {
          finalThumbnailUrl = previewUrl;
          toastActions.showToast("이미지 업로드 실패: 로컬 미리보기로 저장됩니다.", "warning");
        }
      }

      const storyData = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        thumbnailUrl: finalThumbnailUrl,
        path,
        pathColor,
      };

      if (isEditMode && storyId) {
        await updateStory.mutateAsync({ id: storyId, data: storyData });
      } else {
        await createStory.mutateAsync({
          ...storyData,
          date: new Date(date).toISOString(),
          userId: user?.id ?? "",
          workspaceId,
        });
      }

      modalActions.showModal({
        type: "alert",
        title: "성공",
        message: isEditMode ? "기억이 수정되었습니다." : "기억이 기록되었습니다.",
        onConfirm: () => router.back(),
      });
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
