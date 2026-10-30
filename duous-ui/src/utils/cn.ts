type ClassValue = string | false | null | undefined;

/** truthy 클래스명만 공백으로 합쳐 className 문자열을 만든다 */
export const cx = (...classes: ClassValue[]): string => classes.filter(Boolean).join(" ");
