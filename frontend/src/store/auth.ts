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

function getAuthErrorMessage(error: unknown, fallback: string) {
  const authError = error as { code?: string; message?: string; response?: { data?: { detail?: string } } };
  const responseDetail = authError.response?.data?.detail;
  if (responseDetail) {
    return responseDetail;
  }

  switch (authError.code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase. Add this Vercel domain in Firebase Authentication settings.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before it completed.';
    case 'auth/popup-blocked':
      return 'The browser blocked the Google sign-in popup. Allow popups and try again.';
    case 'auth/invalid-api-key':
      return 'Firebase API key is invalid. Check the Vercel Firebase environment variables.';
    case 'auth/configuration-not-found':
      return 'Firebase Authentication is not configured for this project. Enable Google and Email/Password sign-in in Firebase.';
    case 'auth/operation-not-allowed':
      return 'This Firebase sign-in method is not enabled. Enable it in Firebase Authentication.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Use a stronger password.';
    default:
      return authError.message || fallback;
  }
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
          const errorMessage = getAuthErrorMessage(error, 'Login failed');
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
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
          const errorMessage = getAuthErrorMessage(error, 'Registration failed');
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
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
          const errorMessage = getAuthErrorMessage(error, 'Google login failed');
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
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
