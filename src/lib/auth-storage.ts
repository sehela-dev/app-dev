export type AuthRole = "admin" | "user" | "instructor";

const ACTIVE_ROLE_KEY = "auth.activeRole";
const roleKey = (role: AuthRole) => `auth.${role}`;

const safeParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

type LegacyRoleKey = "admin" | "user" | "instructor";
const legacyRoleKeys: LegacyRoleKey[] = ["admin", "instructor", "user"];

type SessionLike = { access_token?: string; refresh_token?: string };

function readLegacySession(role: LegacyRoleKey): SessionLike | null {
  if (typeof window === "undefined") return null;
  return safeParse<SessionLike>(window.localStorage.getItem(role));
}

function inferRoleFromLegacy(): AuthRole | null {
  for (const role of legacyRoleKeys) {
    const legacy = readLegacySession(role);
    if (legacy?.access_token) return role;
  }
  return null;
}

function migrateLegacyRoleIfNeeded(role: AuthRole) {
  if (typeof window === "undefined") return;

  const newKey = roleKey(role);
  const alreadyNew = safeParse(window.localStorage.getItem(newKey));
  if (alreadyNew) return;

  const legacy = readLegacySession(role);
  if (!legacy) return;

  window.localStorage.setItem(newKey, JSON.stringify(legacy));
}

export function getActiveRole(): AuthRole | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(ACTIVE_ROLE_KEY) as AuthRole | null;
  if (stored === "admin" || stored === "user" || stored === "instructor") {
    migrateLegacyRoleIfNeeded(stored);
    return stored;
  }

  const inferred = inferRoleFromLegacy();
  if (inferred) {
    window.localStorage.setItem(ACTIVE_ROLE_KEY, inferred);
    migrateLegacyRoleIfNeeded(inferred);
    return inferred;
  }

  return null;
}

export function setActiveRole(role: AuthRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ROLE_KEY, role);
  migrateLegacyRoleIfNeeded(role);
}

export function getRoleStorageKey(role: AuthRole) {
  return roleKey(role);
}

export function getSession<T = unknown>(role: AuthRole): T | null {
  if (typeof window === "undefined") return null;
  migrateLegacyRoleIfNeeded(role);
  return safeParse<T>(window.localStorage.getItem(roleKey(role)));
}

export function setSession<T>(role: AuthRole, session: T) {
  if (typeof window === "undefined") return;
  setActiveRole(role);
  window.localStorage.setItem(roleKey(role), JSON.stringify(session));
}

export function clearSession(role: AuthRole) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(roleKey(role));

  const active = window.localStorage.getItem(ACTIVE_ROLE_KEY);
  if (active === role) {
    window.localStorage.removeItem(ACTIVE_ROLE_KEY);
  }
}

export function clearAllSessions() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_ROLE_KEY);
  window.localStorage.removeItem(roleKey("admin"));
  window.localStorage.removeItem(roleKey("instructor"));
  window.localStorage.removeItem(roleKey("user"));
}

export function getActiveSession<T = unknown>(): { role: AuthRole; session: T } | null {
  const role = getActiveRole();
  if (!role) return null;
  const session = getSession<T>(role);
  if (!session) return null;
  return { role, session };
}

