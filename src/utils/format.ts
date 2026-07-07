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
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};
