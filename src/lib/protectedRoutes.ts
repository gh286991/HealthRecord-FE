// 集中管理需要登入的主要功能路徑前綴
export const protectedRoutePrefixes: readonly string[] = [
  "/dashboard",
  "/nutrition",
  "/workout",
  "/workout/exercises",
  "/schedule",
  "/analytics",
  "/profile",
] as const;

export function isProtectedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return protectedRoutePrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}


