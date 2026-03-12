export const ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "Supervisor",
  ASSISTANT_MANAGER: "AssistantManager",
  INSPECTOR: "inspector",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  Supervisor: "Supervisor",
  AssistantManager: "Asisten Manajer",
  inspector: "Inspector",
};

/**
 * Helper untuk menentukan dashboard berdasarkan role
 */
export function getDashboardRoute(role: Role) {
  if (ADMIN_ROLES.includes(role)) return "/admin/dashboard";
  if (role === ROLES.ASSISTANT_MANAGER) return "/asmen";
  if (role === ROLES.INSPECTOR) return "/inspection/dashboard";
  return "/unauthorized";
}