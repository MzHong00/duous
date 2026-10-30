# api 컨벤션 (Spring Boot)

`common/convention.md`에 더해 duous-api에만 적용한다.

## 공통 규칙

### 구조

- 함수는 메서드, 파일은 클래스 단위로 본다.
- 구현체가 하나뿐인 인터페이스는 만들지 않는다.

### 작성 규칙

- null 대신 `Optional`을 반환하고, `Object`·raw 타입 대신 구체적인 타입을 쓴다.

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

### 패키지

- 도메인별로 나눈다: `domain/[도메인]/`에 Controller·Service·Repository·Entity, `dto/`를 둔다.
- 공통 설정·보안·예외 처리는 `global/`에 둔다.

### 권한

- 사용자·워크스페이스 ID는 요청 값이 아니라 인증 정보에서 가져온다.
- 워크스페이스 데이터 접근 전 멤버십을 반드시 확인한다. DB의 RLS가 적용되지 않으므로 서버가 유일한 방어선이다.

### 예외

- 예외는 `global/`의 `@RestControllerAdvice` 한 곳에서 응답으로 변환한다.
