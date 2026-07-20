import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError, noContent } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToChatMessage } from "@/features/chat/api/chat";

import type { NextRequest } from "next/server";
import type { MessageRow } from "@/features/chat/api/chat";

/** 메시지 전송 요청 본문 (발신자는 세션에서 확정) */
interface MessageSendRequest {
  workspaceId: string; // 소속 워크스페이스 ID
  text: string; // 메시지 본문
}

/** GET /api/messages?workspaceId= — 워크스페이스의 메시지 목록 (오래된 순, isMine은 세션 사용자 기준) */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("workspaceId가 필요합니다.", 400);

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error) return jsonError("메시지 목록 조회에 실패했습니다.", 500, error);
  return NextResponse.json(
    (data as MessageRow[]).map((row) => rowToChatMessage(row, sessionUser.id))
  );
}

/** POST /api/messages — 메시지 전송 (발신자는 세션 사용자로 확정, 실시간 반영은 클라이언트 구독이 담당) */
export async function POST(request: NextRequest) {
  const { workspaceId, text } = (await request.json()) as MessageSendRequest;
  if (!workspaceId || !text) return jsonError("workspaceId, text는 필수입니다.", 400);

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { error } = await supabase
    .from("messages")
    .insert({ workspace_id: workspaceId, sender_id: sessionUser.id, text });
  if (error) return jsonError("메시지 전송에 실패했습니다.", 500, error);
  return noContent();
}
