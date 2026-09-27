'use client';

import { create } from 'zustand';
import { api, ApiRequestError } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Auth store using Zustand.
 *
 * Design decision: Zustand over React Context for auth state.
 * - No provider nesting required
 * - Works outside of React components (e.g., API interceptors)
 * - Simpler than Context + useReducer
 * - No unnecessary re-renders (subscribes to specific slices)
 *
 * Trade-off: Extra dependency. But Zustand is tiny (~1KB) and the DX gain is worth it.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const response = await api.post<{ user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    set({ user: response.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout should always succeed from the client's perspective
    }
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const user = await api.get<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
