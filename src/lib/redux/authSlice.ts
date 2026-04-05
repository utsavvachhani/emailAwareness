import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile?: string;
  bio?: string;
  designation?: string;
  organization?: string;
  isVerified?: boolean;
}

interface AuthState {
  userInfo: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userInfo: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserInfo; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.userInfo = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("userInfo", JSON.stringify(user));
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
    },
    hydrateAuth: (state) => {
      // Allow re-hydration from localStorage (called by AuthInitializer)
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userInfoStr = localStorage.getItem("userInfo");
        
        if (token && userInfoStr) {
          try {
            state.token = token;
            state.userInfo = JSON.parse(userInfoStr);
            state.isAuthenticated = true;
          } catch (e) {
            console.error("Failed to parse user info from local storage");
          }
        }
      }
    },
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        if (typeof window !== "undefined") {
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        }
      }
    },
  },
});

export const { setCredentials, setToken, logout, hydrateAuth, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
