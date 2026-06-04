"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, UserPlus, Heart, Mail, Send } from "lucide-react";

import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { modalActions } from "@/shared/stores/useModalStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";
import { APP_WORKSPACE } from "@/shared/constants/config";
import { Checkbox } from "@/shared/components/Checkbox";
import { AppHeader } from "@/shared/components/AppHeader";
import { getTodayDateString } from "@/shared/utils/date";
import styles from "./WorkspaceSetupView.module.scss";

type Step = "initial" | "create" | "invite";
type CreateSubStep = "type" | "name";

export const WorkspaceSetupView = () => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());

  const [step, setStep] = useState<Step>("initial");
  const [createSubStep, setCreateSubStep] = useState<CreateSubStep>("type");
  const [roomType, setRoomType] = useState<"couple" | "group">("couple");
  const [workspaceName, setWorkspaceName] = useState("");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [isMain, setIsMain] = useState(true);
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const handleComplete = async () => {
    if (!workspaceName.trim()) {
      modalActions.showModal({
        type: "alert",
        title: "알림",
        message: `${APP_WORKSPACE.KR} 이름을 입력해주세요.`,
      });
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      const { workspace } = await workspacesApi.create(workspaceName, roomType, startDate, user);
      if (isMain) workspaceActions.setCurrentWorkspace(workspace);
      workspaceActions.setWorkspaces([workspace]);
      setCreatedWorkspaceId(workspace.id);
      setStep("invite");
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "워크스페이스 생성 중 문제가 발생했습니다.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteeEmail.trim()) {
      modalActions.showModal({
        type: "alert",
        title: "알림",
        message: "파트너의 이메일을 입력해주세요.",
      });
      return;
    }
    if (!user) return;
    setIsSendingInvite(true);
    try {
      await workspacesApi.sendInvite(createdWorkspaceId, workspaceName, inviteeEmail, user.id);
      modalActions.showModal({
        type: "alert",
        title: "초대 완료",
        message: `${inviteeEmail}에 초대장을 보냈어요.\n파트너에게 앱에 접속해달라고 알려주세요.`,
        onConfirm: () => router.replace("/home"),
      });
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "초대 전송에 실패했습니다.",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleBack = () => {
    if (step === "create" && createSubStep === "name") {
      setCreateSubStep("type");
    } else if (step === "initial") {
      router.back();
    } else {
      setStep("initial");
      setCreateSubStep("type");
    }
  };

  return (
    <div className={styles.page}>
      <AppHeader showBack={true} onBack={handleBack} />

      <div className={styles.inner}>
        {step === "initial" && (
          <div className={styles.stepContent}>
            <div className={styles.topSection}>
              <div className={styles.iconWrap}>
                <Users size={32} />
              </div>
              <h2 className={styles.heading}>{APP_WORKSPACE.KR} 만들기</h2>
              <p className={styles.desc}>
                우리만의 새로운 {APP_WORKSPACE.KR}을 만들고{"\n"}파트너를 초대하여 일상과 기록을
                공유하세요.
              </p>
            </div>
            <div className={styles.bottomSection}>
              <button onClick={() => setStep("create")} className={styles.primaryButton}>
                <Plus size={20} />
                새로운 {APP_WORKSPACE.KR} 만들기
              </button>
            </div>
          </div>
        )}

        {step === "create" && (
          <div className={styles.stepContent}>
            <div className={styles.topSection}>
              {createSubStep === "type" ? (
                <>
                  <h2 className={styles.heading}>유형 선택</h2>
                  <p className={styles.desc}>
                    누구와 함께하는 {APP_WORKSPACE.KR}인가요?{"\n"}나중에 변경할 수 없으니 신중히
                    골라주세요.
                  </p>
                  <div className={styles.typeOptions}>
                    <button
                      onClick={() => setRoomType("couple")}
                      className={[
                        styles.typeButton,
                        roomType === "couple" ? styles.typeButtonActive : styles.typeButtonInactive,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Heart
                        size={24}
                        color={roomType === "couple" ? "#3182F6" : "#8B95A1"}
                        fill={roomType === "couple" ? "#3182F6" : "transparent"}
                      />
                      <span
                        className={[
                          styles.typeLabel,
                          roomType === "couple" ? styles.typeLabelActive : styles.typeLabelInactive,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        커플 라이프룸
                      </span>
                    </button>
                    <button
                      onClick={() => setRoomType("group")}
                      className={[
                        styles.typeButton,
                        roomType === "group" ? styles.typeButtonActive : styles.typeButtonInactive,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Users size={24} color={roomType === "group" ? "#3182F6" : "#8B95A1"} />
                      <span
                        className={[
                          styles.typeLabel,
                          roomType === "group" ? styles.typeLabelActive : styles.typeLabelInactive,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        단체 라이프룸
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.formSection}>
                  <h2 className={styles.heading}>이름 설정</h2>
                  <p className={styles.desc}>
                    우리만의 특별한 {APP_WORKSPACE.KR} 이름을{"\n"}지어주세요.
                  </p>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder={`${APP_WORKSPACE.KR} 이름을 입력하세요`}
                    autoFocus
                    className={styles.input}
                  />
                  <p className={styles.fieldLabel}>
                    {roomType === "couple" ? "만난 날짜" : "시작일"}
                  </p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.input}
                  />
                  <Checkbox
                    label={`메인 ${APP_WORKSPACE.KR}으로 설정`}
                    checked={isMain}
                    onPress={() => setIsMain(!isMain)}
                  />
                </div>
              )}
            </div>
            <div className={styles.bottomSection}>
              <button
                onClick={
                  createSubStep === "type"
                    ? () => {
                        setWorkspaceName("");
                        setCreateSubStep("name");
                      }
                    : handleComplete
                }
                className={styles.primaryButton}
                disabled={isSaving}
              >
                {isSaving ? "생성 중..." : createSubStep === "type" ? "다음" : "시작하기"}
              </button>
              <button onClick={handleBack} className={styles.secondaryButton}>
                이전으로
              </button>
            </div>
          </div>
        )}

        {step === "invite" && (
          <div className={styles.stepContent}>
            <div className={styles.topSection}>
              <div className={styles.iconWrap}>
                <UserPlus size={32} />
              </div>
              <h2 className={styles.heading}>파트너 초대하기</h2>
              <p className={styles.desc}>
                {workspaceName}이(가) 생성되었습니다!{"\n"}파트너의 이메일을 입력하면{"\n"}초대장을
                보내드립니다.
              </p>
              <div className={styles.emailInputWrap} style={{ marginTop: 40 }}>
                <Mail size={20} style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  placeholder="파트너의 이메일 주소"
                  className={styles.emailInput}
                />
              </div>
            </div>
            <div className={styles.bottomSection}>
              <button
                onClick={handleSendInvite}
                className={styles.primaryButton}
                disabled={isSendingInvite}
              >
                <Send size={20} />
                {isSendingInvite ? "전송 중..." : "초대장 보내기"}
              </button>
              <button onClick={() => router.replace("/home")} className={styles.secondaryButton}>
                나중에 하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
