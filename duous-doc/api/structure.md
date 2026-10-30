# api 패키지 구조 (도메인형)

기능 하나의 코드를 도메인 패키지에 모으고, 도메인과 무관한 코드는 `global`에 둔다.

```
com.duous.api
├─ global/
│  ├─ config/      공통 설정
│  ├─ security/    SecurityConfig, AuthUser, @CurrentUser
│  └─ error/       ErrorCode, BusinessException, GlobalExceptionHandler
├─ domain/
│  ├─ profile/     profiles
│  ├─ workspace/   workspaces, workspace_members, workspace_invites
│  ├─ story/       stories
│  ├─ todo/        todos
│  ├─ calendar/    calendar_events
│  └─ message/     messages
└─ agent/          여러 도메인을 조합하는 AI 에이전트
```

도메인 패키지 내부는 평평하게 두고 `dto/`만 나눈다.

```
domain/todo/
├─ Todo.java                 Entity
├─ TodoRepository.java
├─ TodoService.java
├─ TodoController.java
└─ dto/                      TodoCreateRequest, TodoResponse
```

## 규칙

- 의존은 한 방향이다: `story`·`todo`·`calendar`·`message` → `workspace` → `profile`.
- 다른 도메인의 Repository·Entity는 쓰지 않고 Service를 호출한다. Repository·Entity는 package-private으로 둔다.
- 다른 도메인은 ID로 참조한다. `@ManyToOne`은 같은 도메인 안에서만 쓴다.
- `global`은 `domain`을, `domain`은 `agent`를 import하지 않는다.
- 화면 개념(home, map, anniversary)은 도메인으로 만들지 않는다. 도메인 이름은 프론트 entity와 맞춘다.
