import apiClient from '../api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  GoogleLoginRequest,
  FirebaseLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types/api';

export const authApi = {
  // Login with email/password
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);
    
    // Use URLSearchParams to ensure application/x-www-form-urlencoded
    const response = await apiClient.post<AuthResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', data);
    return response.data;
  },

  firebaseLogin: async (data: FirebaseLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/firebase', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ detail: string; user: User }> => {
    const response = await apiClient.post<{ detail: string; user: User }>('/auth/change-password', data);
    return response.data;
  },
};

export const userApi = {
  // Get current user
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  // Refill hearts
  refillHearts: async (): Promise<User> => {
    const response = await apiClient.post<User>('/users/me/hearts/refill');
    return response.data;
  },

  // Reduce hearts
  reduceHearts: async (): Promise<User> => {
    const response = await apiClient.post<User>('/users/me/hearts/reduce');
    return response.data;
  },

  // Add XP
  addXP: async (xp: number): Promise<User> => {
    const response = await apiClient.post<User>('/users/me/xp/add', { xp });
    return response.data;
  },

  // Get streak info
  getStreak: async () => {
    const response = await apiClient.get('/users/me/streak');
    return response.data;
  },

  // Activate streak freeze
  freezeStreak: async () => {
    const response = await apiClient.post('/users/me/streak/freeze');
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string; filename: string }>('/users/upload', formData);
    return response.data;
  },
};
