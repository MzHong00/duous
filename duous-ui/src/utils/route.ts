/** base 뒤에 경로 파라미터를 이어붙인다 (끝 슬래시 정리 + 인코딩) */
export const withParams = (base: string, ...params: (string | number)[]): string =>
  [base.replace(/\/+$/, ""), ...params.map((param) => encodeURIComponent(String(param)))].join("/");

/** base 뒤에 정의된 값만 쿼리스트링으로 붙인다 (인코딩) */
export const withQuery = (base: string, params: Record<string, string | undefined>): string => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join("&");
  return query ? `${base}?${query}` : base;
};

/** 앱 내부 상대 경로인지 검증한다("/"로 시작하되 "//", "/\" 등 브라우저가 프로토콜 상대 경로로 해석할 수 있는 형태는 제외해 오픈 리다이렉트를 방지
 * 브라우저는 URL 파싱 시 탭/개행 문자를 제거하므로, "/\t/evil.com" 같은 문자열도 제거 후 기준으로 검증한다 */
export const isSafeRedirectPath = (path: string | null | undefined): path is string => {
  if (!path) return false;
  const normalized = path.replace(/[\t\r\n]/g, "");
  return normalized.startsWith("/") && !/^\/[/\\]/.test(normalized);
};
