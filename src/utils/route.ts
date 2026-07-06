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
