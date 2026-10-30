# api 컨벤션 (Spring Boot)

`common/convention.md`에 더해 duous-api에만 적용한다.

## 공통 규칙

### 구조

- 함수는 메서드, 파일은 클래스 단위로 본다.
- 구현체가 하나뿐인 인터페이스는 만들지 않는다(Spring Data Repository는 예외).

### 작성 규칙

- null 대신 `Optional`을 반환하고(필드·파라미터에는 쓰지 않는다), `Object`·raw 타입 대신 구체적인 타입을 쓴다.

### 오류 처리

- 빈 `catch`로 예외를 삼키지 않는다. 처리할 수 없으면 그대로 던진다.

### 레이어

- Controller는 요청 검증과 응답 변환만 한다. 로직은 Service에 둔다.
- Service는 비즈니스 로직과 권한 체크를 맡는다. 조회 메서드는 `@Transactional(readOnly = true)`를 붙인다.
- Entity는 응답으로 직접 내보내지 않고 DTO로 변환한다.

### 의존성 주입

- 생성자 주입만 쓴다(`private final` + `@RequiredArgsConstructor`). 필드 `@Autowired`는 쓰지 않는다.

### DTO·Entity

- DTO는 `record`로 쓰고, 요청 값은 `@Valid`와 Bean Validation으로 검증한다.
- Entity에 `@Data`·`@Setter`를 쓰지 않는다. 값 변경은 의도가 드러나는 메서드로 한다.

### 보안

- 비밀값은 코드나 `application.yaml`에 쓰지 않고 환경 변수로 주입한다.

## 프로젝트 규칙

### 구조

- 패키지 구조는 `api/structure.md`를 따른다.

### 인증·인가

- 인증은 Spring Security로 처리한다. 사용자 ID는 인증 정보에서만 가져온다.
- 워크스페이스 데이터는 Service에서 `WorkspaceAccessChecker`로 멤버십을 확인한다. ID로 조회한 데이터는 그 데이터의 workspaceId로 확인한다.
- 멤버가 아니면 `404`, 멤버지만 권한이 부족하면 `403`으로 응답한다.
- DB에 접근 제어(RLS)가 없으므로 서버가 유일한 방어선이다.

### 예외

- 비즈니스 예외는 `BusinessException(ErrorCode)`로 던진다.
- 모든 오류 응답(Security 401·403 포함)은 `ProblemDetail` 형식으로 통일한다.

### API·JPA

- 경로는 복수 명사로 쓴다. 목록·생성은 `/api/workspaces/{id}/todos`, 단건은 `/api/todos/{id}`.
- 시점은 `Instant`, 날짜는 `LocalDate`, 시각은 `LocalTime`을 쓴다.
- `open-in-view: false`, `ddl-auto: validate`. 연관은 LAZY로 두고 필요하면 fetch join을 쓴다.

### 테스트

- 기능마다 "다른 워크스페이스 사용자는 접근할 수 없다" 테스트를 둔다.
