import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { TODO_COLORS } from "@/constants/theme";
import { getTodayDateString } from "@/utils/date";

import { todoQueries } from "@/features/todo/queries/todoQueries";
import {
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from "@/features/todo/queries/todoMutations";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";

/**
 * 할 일 생성/수정 폼의 상태와 저장·삭제 로직을 관리하는 훅.
 * todoId가 있으면 수정 모드, 없으면 생성 모드로 동작한다.
 */
export const useTodoForm = (todoId: string | null, initialDate: string | null) => {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";
  const { data: todos = [] } = useQuery(todoQueries.list(workspaceId));
  const createTodo = useCreateTodoMutation(workspaceId);
  const updateTodo = useUpdateTodoMutation(workspaceId);
  const deleteTodo = useDeleteTodoMutation(workspaceId);

  // 수정 모드일 때 기존 할 일을 찾아 초기값으로 사용한다.
  const existingTodo = useMemo(
    () => (todoId ? todos.find((t) => t.id === todoId) : null),
    [todoId, todos]
  );

  const [title, setTitle] = useState(existingTodo?.title || ""); // 제목
  const [description, setDescription] = useState(existingTodo?.description || ""); // 설명
  const [assigneeId, setAssigneeId] = useState<string | undefined>(existingTodo?.assigneeId); // 담당자 id
  const [startDate, setStartDate] = useState(
    existingTodo?.startDate || initialDate || getTodayDateString()
  ); // 시작일
  const [endDate, setEndDate] = useState(
    existingTodo?.endDate || initialDate || getTodayDateString()
  ); // 종료일
  const [selectedColor, setSelectedColor] = useState(
    () => existingTodo?.color || TODO_COLORS[Math.floor(Math.random() * TODO_COLORS.length)]
  ); // 선택된 색상

  /** 수정 모드에서 할 일 쿼리 로드가 초기 렌더보다 늦을 수 있어, 로드 완료 시 폼 값을 채운다 */
  useEffect(() => {
    if (!existingTodo) return;
    setTitle(existingTodo.title || "");
    setDescription(existingTodo.description || "");
    setAssigneeId(existingTodo.assigneeId);
    setStartDate(existingTodo.startDate);
    setEndDate(existingTodo.endDate);
    setSelectedColor(existingTodo.color || TODO_COLORS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTodo?.id]);

  const members = currentWorkspace?.members || [];

  /** 삭제 확인 모달을 띄우고 확인 시 서버에서 항목을 제거한다 */
  const handleDelete = () => {
    if (!todoId) return;
    modalActions.showModal({
      type: "confirm",
      title: "삭제",
      message: "이 항목을 삭제하시겠습니까?",
      onConfirm: async () => {
        try {
          await deleteTodo.mutateAsync(todoId);
          router.back();
        } catch {
          toastActions.showToast("삭제에 실패했습니다. 다시 시도해주세요.", "error");
        }
      },
    });
  };

  /** 입력값을 검증한 뒤 서버에 생성/수정하고 이전 화면으로 돌아간다 */
  const handleSave = async () => {
    if (!title.trim()) {
      toastActions.showToast("제목을 입력해주세요.", "error");
      return;
    }
    if (!currentWorkspace) return;

    const todoData = {
      workspaceId: currentWorkspace.id,
      title: title.trim(),
      description: description.trim(),
      isCompleted: false,
      assigneeId,
      startDate,
      endDate,
      color: selectedColor,
    };

    try {
      if (todoId) {
        await updateTodo.mutateAsync({ id: todoId, updates: todoData });
        toastActions.showToast("항목이 수정되었습니다.", "success");
      } else {
        await createTodo.mutateAsync(todoData);
      }
      router.back();
    } catch {
      toastActions.showToast("저장에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    assigneeId,
    setAssigneeId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedColor,
    setSelectedColor,
    members,
    handleSave,
    handleDelete,
  };
};
