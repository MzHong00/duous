/** API 계층에서 발생한 네트워크·HTTP 에러를 감싸는 도메인 에러. 원본 에러는 cause로 보존한다. */
export class ApiError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = "ApiError";
  }
}
