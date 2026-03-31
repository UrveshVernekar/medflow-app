export function requireRole(role: string, allowed: string[]) {
  if (!allowed.includes(role)) {
    throw new Error("Unauthorized");
  }
}
