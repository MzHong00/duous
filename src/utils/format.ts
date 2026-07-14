export const joinValuesWithDot = <T extends object>(
  arr: T[] | undefined,
  key: keyof T,
  excludeValue?: string
): string => {
  if (!arr) return "";
  return arr
    .map((item) => {
      const value = item[key];
      return typeof value === "string" ? value : "";
    })
    .filter((val) => val && val !== excludeValue)
    .join(" · ");
};

export const getInitials = (name: string): string => {
  const trimmed = name.trim(); // 공백만 있는 이름도 빈 값으로 취급해 "?" 폴백을 노출
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
};
