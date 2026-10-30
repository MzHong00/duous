# 작업 목록

하고 싶은 작업을 등록하고 상태별로 관리한다.

## 규칙

- ID는 `DU-번호`로 매기고 1씩 늘린다. 삭제해도 번호는 재사용하지 않는다.
- 상태가 바뀌면 해당 섹션으로 옮긴다: 할 일 → 진행 중 → 완료.
- 영역: `ui`, `api`, `doc`. 에픽은 관련 작업 묶음 이름이다.

## 진행 중

| ID | 작업 | 영역 | 에픽 | 비고 |
| -- | ---- | ---- | ---- | ---- |

## 할 일

| ID     | 작업                                                    | 영역   | 에픽         | 비고                                      |
| ------ | ------------------------------------------------------- | ------ | ------------ | ----------------------------------------- |
| DU-002 | 예외 처리(ErrorCode, BusinessException, ProblemDetail)  | api    | Spring 기반  |                                           |
| DU-003 | 공통 설정(CORS, JPA), 환경 변수                         | api    | Spring 기반  |                                           |
| DU-004 | DB 스키마·RLS 정책 백업, 스키마 관리 방식 결정          | api    | Spring 기반  | Flyway 여부                               |
| DU-005 | WorkspaceAccessChecker                                  | api    | 데이터 API   |                                           |
| DU-006 | profile API(내 정보 조회·생성·수정)                     | api    | 데이터 API   | 메인 워크스페이스 설정 시 멤버십 확인     |
| DU-007 | workspace API(목록·생성·수정)                           | api    | 데이터 API   |                                           |
| DU-008 | 초대 코드 조회·발급, 코드 미리보기(비로그인)            | api    | 데이터 API   | RPC `get_invite_preview` 대체             |
| DU-009 | 초대 코드로 참여                                        | api    | 데이터 API   | RPC `join_workspace_with_code` 대체       |
| DU-010 | 멤버 강퇴·나가기, 방장 위임                             | api    | 데이터 API   | RPC `transfer_workspace_ownership` 대체   |
| DU-011 | todo API                                                | api    | 데이터 API   |                                           |
| DU-012 | calendar API                                            | api    | 데이터 API   |                                           |
| DU-013 | story API                                               | api    | 데이터 API   | `path` JSON 컬럼                          |
| DU-014 | message API(목록·전송)                                  | api    | 데이터 API   |                                           |
| DU-015 | 워크스페이스 하위 데이터 FK `ON DELETE CASCADE`         | api    | 데이터 API   |                                           |
| DU-016 | Google OAuth 로그인·로그아웃                            | api    | 인증         | 로그인 유지 방식(세션/JWT) 결정           |
| DU-017 | 첫 로그인 시 프로필 생성                                | api    | 인증         |                                           |
| DU-018 | 테스트 계정 로그인                                      | api    | 인증         |                                           |
| DU-019 | 기존 Supabase 사용자 ID 유지 방안                       | api    | 인증         |                                           |
| DU-020 | 채팅 WebSocket(STOMP), 연결 인증·구독 멤버십 확인       | api    | 실시간       |                                           |
| DU-021 | 스토리지 연동, 업로드 URL(presigned URL) 발급           | api    | 파일         |                                           |
| DU-022 | 이미지 교체·워크스페이스 삭제 시 기존 파일 삭제         | api    | 파일         |                                           |
| DU-023 | Supabase Storage 이미지 이전                            | api    | 파일         |                                           |
| DU-024 | UI를 Spring API로 연결                                  | ui     | Supabase 제거 | 데이터·인증·채팅·파일 단계별             |
| DU-025 | UI의 Supabase 코드 제거                                 | ui     | Supabase 제거 | `app/api`, `server/`, `lib/supabase`, `proxy.ts` 세션 |
| DU-026 | 데이터를 새 DB로 이전                                   | api    | Supabase 제거 |                                           |
| DU-027 | api 배포                                                | api    | Supabase 제거 |                                           |
| DU-028 | FSD 구조로 전환                                         | ui     | UI 구조      | `ui/structure.md`, Supabase 제거 후 진행  |
| DU-029 | AI 에이전트(Tool Calling)                               | api·ui | AI           | 도구는 도메인 Service 호출                |

## 완료

| ID | 작업 | 영역 | 에픽 | 완료일 |
| -- | ---- | ---- | ---- | ------ |
| DU-001 | 의존성 추가(data-jpa, validation, security, postgresql 등) | api | Spring 기반 | 2026-10-30 |
