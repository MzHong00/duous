# 시스템 구성

```
브라우저 ─▶ duous-ui (Next.js) ─▶ duous-api (Spring Boot) ─┬▶ PostgreSQL
                                     REST · WebSocket       └▶ 파일 스토리지
```

| 구성      | 역할                                   | 기술                         |
| --------- | -------------------------------------- | ---------------------------- |
| duous-ui  | 화면                                   | Next.js                      |
| duous-api | 데이터 API, 인증·인가, 채팅 실시간     | Spring Boot                  |
| DB        | 데이터 저장                            | PostgreSQL                   |
| 스토리지  | 이미지 저장                            | S3 호환 스토리지             |

- duous-ui는 duous-api하고만 통신한다. DB·스토리지에 직접 접근하지 않는다.
- 인증: Google OAuth 로그인을 duous-api(Spring Security)가 처리한다.
- 실시간: 채팅은 WebSocket(STOMP)으로 주고받는다.
- 파일: duous-api가 발급한 업로드 URL(presigned URL)로 스토리지에 올린다.
- Supabase는 이전이 끝나면 제거한다. 이전 순서: 데이터 API → 인증 → 실시간 → 파일.
