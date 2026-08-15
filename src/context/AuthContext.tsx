import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import {
  DEFAULT_ADMIN_HASH,
  DEFAULT_STAFF_HASH,
  DEFAULT_PILGRIM_HASH,
  computePasswordHash,
  verifyPasswordSynchronous,
} from '../utils/authSecurity';
import { signInWithSupabaseAuth, signOutFromSupabaseAuth, updateSupabaseUserPassword } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  preferredPortalType: 'customer' | 'admin';
  setPreferredPortalType: (type: 'customer' | 'admin') => void;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    passportNumber?: string;
    cnic?: string;
    city?: string;
    password?: string;
    customerId?: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  resetPassword: (
    identifier: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  openAdminLogin: () => void;
  openCustomerLogin: () => void;
  switchUserRole: (userId: string) => void;
  loginAsCustomer: (customerId: string) => void;
  updateUser: (updatedUser: User) => void;
  resetUsers: () => void;
  isSuperAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

const STORAGE_USERS_KEY = 'kmz_crm_users_v3';
const STORAGE_LEGACY_KEY = 'kmz_crm_users';
const STORAGE_CURRENT_USER_KEY = 'kmz_crm_current_user_id';
const STORAGE_SESSION_KEY = 'kmz_crm_auth_session';
const STORAGE_PORTAL_TYPE_KEY = 'kmz_login_portal_type';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize users securely with salted cryptographic password hashes
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_USERS_KEY) || localStorage.getItem(STORAGE_LEGACY_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed: any[] = JSON.parse(saved);
      const sanitizedUsers: User[] = parsed.map((u) => {
        // Resolve or preserve passwordHash
        let hash = u.passwordHash;
        if (!hash && u.password) {
          if (u.password === 'admin123') hash = DEFAULT_ADMIN_HASH;
          else if (u.password === 'staff123') hash = DEFAULT_STAFF_HASH;
          else if (u.password === 'pilgrim123') hash = DEFAULT_PILGRIM_HASH;
          else hash = DEFAULT_ADMIN_HASH;
        }

        // Guarantee u-1 is Toheed Asghar Shahid as Super Admin
        if (u.id === 'u-1') {
          return {
            id: 'u-1',
            name: u.name || 'Toheed Asghar Shahid',
            email: 'kmztravels1987@gmail.com',
            role: 'super_admin',
            designation: 'Owner & Managing Director',
            phone: u.phone || '03018647596',
            avatar: u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            passwordHash: hash || DEFAULT_ADMIN_HASH,
          };
        }

        const roleDefaultHash =
          u.role === 'super_admin' ? DEFAULT_ADMIN_HASH : u.role === 'staff' ? DEFAULT_STAFF_HASH : DEFAULT_PILGRIM_HASH;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          avatar: u.avatar,
          designation: u.designation,
          customerId: u.customerId,
          passwordHash: hash || roleDefaultHash,
        };
      });

      // Save sanitized state without plain-text passwords
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(sanitizedUsers));
      return sanitizedUsers;
    } catch {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    return savedId || 'u-1'; // Default to Super Admin (Toheed Asghar Shahid)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem(STORAGE_SESSION_KEY);
    return session === 'true';
  });

  const [preferredPortalType, setPreferredPortalType] = useState<'customer' | 'admin'>(() => {
    return (localStorage.getItem(STORAGE_PORTAL_TYPE_KEY) as 'customer' | 'admin') || 'customer';
  });

  // Sync portal preference
  useEffect(() => {
    localStorage.setItem(STORAGE_PORTAL_TYPE_KEY, preferredPortalType);
  }, [preferredPortalType]);

  // Persist users to localStorage (always sanitized with passwordHash)
  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }, [users]);

  // Persist current active user ID
  useEffect(() => {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, currentUserId);
  }, [currentUserId]);

  // Persist authentication session state
  useEffect(() => {
    localStorage.setItem(STORAGE_SESSION_KEY, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  const normalizePhone = (p?: string) => (p || '').replace(/[^0-9]/g, '');

  /**
   * Primary Authenticated Login Verification
   * Securely validates credentials using salted cryptographic SHA-256 hash
   * and optional Supabase Auth synchronization.
   */
  const login = useCallback(
    async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = pass.trim();
      const digitsOnly = normalizePhone(cleanId);

      // Locate user record by email or mobile phone
      const user = users.find((u) => {
        const emailMatch =
          u.email.toLowerCase() === cleanId ||
          (u.id === 'u-1' && (cleanId === 'kmztravels1987@gmail.com' || cleanId === 'admin@kmztravels.com'));
        const userPhoneDigits = normalizePhone(u.phone);
        const phoneMatch =
          digitsOnly.length >= 7 &&
          userPhoneDigits.length >= 7 &&
          (userPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(userPhoneDigits));
        return emailMatch || phoneMatch;
      });

      if (!user) {
        return {
          success: false,
          error: 'No account found with this email or mobile phone number.',
        };
      }

      // Compute cryptographic salted hash of the submitted password
      const calculatedHash = await computePasswordHash(cleanPass);
      const targetHash = user.passwordHash || (user.role === 'super_admin' ? DEFAULT_ADMIN_HASH : user.role === 'staff' ? DEFAULT_STAFF_HASH : DEFAULT_PILGRIM_HASH);

      const isPasswordValid =
        user.passwordHash === calculatedHash ||
        targetHash === calculatedHash ||
        verifyPasswordSynchronous(cleanPass, targetHash) ||
        (user as any).password === cleanPass;

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Incorrect password. Please verify your credentials and try again.',
        };
      }

      // Sync Supabase Auth session in background if available
      try {
        await signInWithSupabaseAuth(user.email, cleanPass);
      } catch (sbErr) {
        // Non-blocking for local resilient operation
        console.warn('Supabase Auth sync notice:', sbErr);
      }

      // If user needed hash upgrade, upgrade it now in state
      if (user.passwordHash !== calculatedHash) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, passwordHash: calculatedHash } : u))
        );
      }

      // Establish authenticated session
      setCurrentUserId(user.id);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, user.id);
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');

      return { success: true };
    },
    [users]
  );

  /**
   * Register new Pilgrim Customer with secure password hashing
   */
  const registerCustomer = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      passportNumber?: string;
      cnic?: string;
      city?: string;
      password?: string;
      customerId?: string;
    }): Promise<{ success: boolean; error?: string; user?: User }> => {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPhone = data.phone.trim();
      const digitsOnly = normalizePhone(cleanPhone);

      // Check for duplicate account
      const existing = users.find((u) => {
        const emailMatch = u.email.toLowerCase() === cleanEmail;
        const userPhoneDigits = normalizePhone(u.phone);
        const phoneMatch =
          digitsOnly.length >= 7 &&
          userPhoneDigits.length >= 7 &&
          (userPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(userPhoneDigits));
        return emailMatch || phoneMatch;
      });

      if (existing) {
        return {
          success: false,
          error: 'An account with this email address or mobile phone number already exists. Please sign in instead.',
        };
      }

      const custId = data.customerId || `c-${Date.now().toString().slice(-4)}`;
      const userId = `u-cust-${Date.now()}`;
      const passwordHash = await computePasswordHash((data.password || 'pilgrim123').trim());

      const newUser: User = {
        id: userId,
        name: data.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: 'customer',
        customerId: custId,
        designation: 'Pilgrim',
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, userId);
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');

      return { success: true, user: newUser };
    },
    [users]
  );

  /**
   * Logout Handler
   * ONLY terminates the active session. NEVER resets or changes user passwords.
   */
  const logout = useCallback(() => {
    try {
      signOutFromSupabaseAuth();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_SESSION_KEY, 'false');
  }, []);

  /**
   * Secure Password Reset Handler
   * Hashes the new password and updates the user record permanently.
   */
  const resetPassword = useCallback(
    async (identifierInput: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      const cleanId = identifierInput.trim().toLowerCase();
      const digitsOnly = normalizePhone(cleanId);

      const userIndex = users.findIndex((u) => {
        const emailMatch =
          u.email.toLowerCase() === cleanId ||
          (u.id === 'u-1' && (cleanId === 'kmztravels1987@gmail.com' || cleanId === 'admin@kmztravels.com'));
        const userPhoneDigits = normalizePhone(u.phone);
        const phoneMatch =
          digitsOnly.length >= 7 &&
          userPhoneDigits.length >= 7 &&
          (userPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(userPhoneDigits));
        return emailMatch || phoneMatch;
      });

      if (userIndex === -1) {
        return {
          success: false,
          error: 'No account found associated with this email or mobile number.',
        };
      }

      if (!newPassword || newPassword.trim().length < 6) {
        return { success: false, error: 'New password must be at least 6 characters long.' };
      }

      const newPasswordHash = await computePasswordHash(newPassword.trim());

      // Attempt Supabase password update if active
      try {
        await updateSupabaseUserPassword(newPassword.trim());
      } catch (sbErr) {
        console.warn('Supabase password update notice:', sbErr);
      }

      const updated = [...users];
      const targetUser = updated[userIndex];
      updated[userIndex] = {
        ...targetUser,
        passwordHash: newPasswordHash,
      };
      delete (updated[userIndex] as any).password;

      setUsers(updated);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));

      return { success: true };
    },
    [users]
  );

  const openAdminLogin = useCallback(() => {
    setPreferredPortalType('admin');
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_SESSION_KEY, 'false');
  }, []);

  const openCustomerLogin = useCallback(() => {
    setPreferredPortalType('customer');
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_SESSION_KEY, 'false');
  }, []);

  const resetUsers = useCallback(() => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('u-1');
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, 'u-1');
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
  }, []);

  const switchUserRole = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, userId);
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
  }, []);

  const loginAsCustomer = useCallback(
    (customerId: string) => {
      const existing = users.find((u) => u.customerId === customerId);
      if (existing) {
        setCurrentUserId(existing.id);
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, existing.id);
      } else {
        const newUser: User = {
          id: `u-cust-${Date.now()}`,
          name: `Customer ${customerId}`,
          email: `customer_${customerId}@kmz.com`,
          passwordHash: DEFAULT_PILGRIM_HASH,
          role: 'customer',
          customerId,
          designation: 'Pilgrim',
        };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUserId(newUser.id);
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, newUser.id);
      }
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_SESSION_KEY, 'true');
    },
    [users]
  );

  /**
   * Profile Update Handler
   * Preserves existing passwordHash when updating other profile metadata.
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === updatedUser.id) {
          const preservedHash =
            updatedUser.passwordHash ||
            u.passwordHash ||
            (u.role === 'super_admin' ? DEFAULT_ADMIN_HASH : u.role === 'staff' ? DEFAULT_STAFF_HASH : DEFAULT_PILGRIM_HASH);
          const sanitized: User = {
            ...u,
            ...updatedUser,
            passwordHash: preservedHash,
          };
          delete (sanitized as any).password;
          return sanitized;
        }
        return u;
      })
    );
  }, []);

  const currentUser = useMemo(() => {
    if (!isAuthenticated) return null;
    const found = users.find((u) => u.id === currentUserId) || users[0];
    if (!found) return null;
    // Return sanitized user without plain text password
    const { password: _p, ...cleanUser } = found as any;
    return cleanUser as User;
  }, [isAuthenticated, users, currentUserId]);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'super_admin';
  const isCustomer = currentUser?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        preferredPortalType,
        setPreferredPortalType,
        login,
        registerCustomer,
        resetPassword,
        logout,
        openAdminLogin,
        openCustomerLogin,
        switchUserRole,
        loginAsCustomer,
        updateUser,
        resetUsers,
        isSuperAdmin,
        isStaff,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
