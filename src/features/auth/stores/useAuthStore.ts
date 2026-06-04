"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken: refreshToken ?? null, isAuthenticated: true }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      version: 2,
      migrate: () => ({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }
  )
);

export const authActions = {
  setAuth: (accessToken: string, refreshToken?: string) =>
    useAuthStore.getState().setAuth(accessToken, refreshToken),
  clearAuth: () => useAuthStore.getState().clearAuth(),
};
