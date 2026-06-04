import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';
import { authApi, userApi } from '@/lib/api/auth';
import { getFirebaseAuth, signInWithGoogle, signOutWithGoogle } from '@/lib/firebase';

function persistAuthSession(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const credential = await signInWithEmailAndPassword(
            getFirebaseAuth(),
            credentials.username,
            credentials.password
          );
          const token = await credential.user.getIdToken();
          const response = await authApi.firebaseLogin({ token });
          persistAuthSession(response.access_token, response.refresh_token);
          const user = response.user ?? await userApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          console.error("Login attempt failed:", error);
          const errorMessage = (error as { response?: { data?: { detail?: string } } } & Error).response?.data?.detail || (error as Error).message || 'Login failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const credential = await createUserWithEmailAndPassword(
            getFirebaseAuth(),
            data.email,
            data.password
          );
          if (data.full_name) {
            await updateProfile(credential.user, { displayName: data.full_name });
          }
          const token = await credential.user.getIdToken(true);
          const response = await authApi.firebaseLogin({ token });
          persistAuthSession(response.access_token, response.refresh_token);
          const user = response.user ?? await userApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          console.error(error);
          set({ 
            error: (error as Error).message || 'Registration failed',
            isLoading: false 
          });
          throw error;
        }
      },

      googleLogin: async () => {
        set({ isLoading: true, error: null });
        try {
          const firebaseUser = await signInWithGoogle();
          const idToken = await firebaseUser.getIdToken();
          const response = await authApi.firebaseLogin({ token: idToken });
          persistAuthSession(response.access_token, response.refresh_token);
          const user = response.user ?? await userApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          console.error("Google login attempt failed:", error);
          const errorMessage = (error as { response?: { data?: { detail?: string } } } & Error).response?.data?.detail || (error as Error).message || 'Google login failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        await signOutWithGoogle().catch(() => undefined);
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const user = await userApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false, isAuthenticated: false });
        }
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
