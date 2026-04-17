import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────
interface User {
  id: number; // Changed from pk to id to match our OutputSerializer
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  // Simplified payload to match Django RegisterInputSerializer
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: (uid: string, token: string) => Promise<void>;
  // Simplified payload to match Django PasswordResetConfirmInputSerializer
  resetPassword: (uid: string, token: string, newPassword: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ─── State ──────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ─── Actions ────────────────────────────────────────
      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // No need to extract tokens! The browser saves the cookies silently.
          const { data } = await api.post('/auth/login/', { email, password });
          set({
            user: data, // Our LoginAPIView returns the UserOutputSerializer data!
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.email?.[0] ||
            'Login failed. Please check your credentials.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (firstName, lastName, email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Pointing to our custom /auth/register/ endpoint
          await api.post('/auth/register/', {
            first_name: firstName,
            last_name: lastName,
            email,
            password,
          });

          // Note: Our backend does NOT log the user in upon registration 
          // because they MUST verify their email first.
          set({ isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.email?.[0] ||
            'Registration failed. Please try again.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      verifyEmail: async (uid: string, token: string) => {
        set({ isLoading: true, error: null });
        try {
          // Pointing to your Django verification endpoint
          await api.post('/auth/verify-email/', {
            user_id: parseInt(uid),
            token: token
          });

          set({ isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.detail ||
            'Verification failed. This link may be invalid or expired.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout/');
        } catch (err) {
          console.error("Backend logout failed, clearing local state anyway.", err);
        } finally {
          set({ user: null, isAuthenticated: false, error: null });
          // Reset workspace store so next login re-fetches cleanly
          const { useWorkspaceStore } = await import('@/stores/workspaceStore');
          useWorkspaceStore.setState({ workspace: null, hasChecked: false, error: null });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          // Pointing to our custom /auth/password-reset/ endpoint
          await api.post('/auth/password-reset/', { email });
          set({ isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.email?.[0] ||
            'Failed to send reset email.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      resetPassword: async (uid, token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          // Pointing to our custom /auth/password-reset/confirm/ endpoint
          await api.post('/auth/password-reset/confirm/', {
            user_id: parseInt(uid), // Backend expects an integer ID
            token: token,
            new_password: newPassword,
          });
          set({ isLoading: false });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            'Password reset failed. The link may be expired.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      googleLogin: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          // Pointing to our custom Google Auth endpoint
          const { data } = await api.post('/auth/login/google/', { token });
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const message =
            err.response?.data?.error ||
            'Google login failed.';
          set({ isLoading: false, error: message });
          throw err;
        }
      },
    }),
    {
      name: 'postminer-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // CRITICAL SECUIRTY FIX: We ONLY persist the user data and auth status.
        // The JWT tokens are no longer accessible to JavaScript.
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);