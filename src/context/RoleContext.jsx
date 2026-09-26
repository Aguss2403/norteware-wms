import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const ROLES = Object.freeze({
  OPERATOR: 'operator',
  MANAGER: 'manager',
});

const ROLE_STORAGE_KEY = 'norteware-demo-role';
const VALID_ROLES = new Set(Object.values(ROLES));
const RoleContext = createContext(null);

function normalizeRole(value) {
  return VALID_ROLES.has(value) ? value : ROLES.OPERATOR;
}

function loadRole() {
  if (typeof window === 'undefined') return ROLES.OPERATOR;

  try {
    return normalizeRole(window.localStorage.getItem(ROLE_STORAGE_KEY));
  } catch {
    return ROLES.OPERATOR;
  }
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(loadRole);

  const setRole = useCallback((nextRole) => {
    const normalizedRole = normalizeRole(nextRole);
    setRoleState(normalizedRole);

    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, normalizedRole);
    } catch {
      // The demo remains usable when browser storage is unavailable.
    }
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
