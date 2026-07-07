"use client";
import { useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { getDateWithOffset } from "@/utils/date";

import { useTodoForm } from "@/features/todo/hooks/useTodoForm";
import { ColorPicker } from "@/features/todo/components/ColorPicker";
import { AssigneePicker } from "@/features/todo/components/AssigneePicker";

import styles from "./TodoCreateView.module.scss";

const QUICK_DATES = [
  { label: "오늘", offset: 0 },
  { label: "내일", offset: 1 },
  { label: "다음 주", offset: 7 },
];

export const TodoCreateView = () => {
  const searchParams = useSearchParams();
  const todoId = searchParams.get("todoId");
  const initialDate = searchParams.get("initialDate");

  const {
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
  } = useTodoForm(todoId, initialDate);

  return (
    <div className={styles.page}>
      <AppHeader
        rightElement={
          todoId ? (
            <button onClick={handleDelete} className={styles.deleteButton}>
              <Trash2 size={20} color="var(--error)" />
            </button>
          ) : undefined
        }
      />

      <div className={styles.scrollArea}>
        <div className={styles.field}>
          <label className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="무엇을 하나요? (예: 데이트, 장보기)"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상세 내용을 입력해주세요."
            rows={3}
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value > endDate) setEndDate(e.target.value);
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>종료일</label>
          <div className={styles.quickDates}>
            {QUICK_DATES.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const d = getDateWithOffset(item.offset);
                  setEndDate(d);
                  if (d < startDate) setStartDate(d);
                }}
                className={styles.quickDateButton}
              >
                {item.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (e.target.value < startDate) setStartDate(e.target.value);
            }}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>색상 선택</label>
          <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>담당자 지정</label>
          <AssigneePicker members={members} assigneeId={assigneeId} onSelect={setAssigneeId} />
        </div>
      </div>

      <div className={styles.footer}>
        <button onClick={handleSave} className={styles.saveButton}>
          {todoId ? "저장하기" : "추가하기"}
        </button>
      </div>
    </div>
  );
};
