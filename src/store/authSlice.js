// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPermissions } from "/src/config/permissions.js"; // FIXED PATH
import { requestFcmToken, onForegroundFcmMessage } from "../firebase/fcm";
import http from "../services/httpClient";

// AUTH APIs
import { login, getAuthProfile } from "../features/auth/api";

// USER APIs
import {
  updateProfile,
  updateProfileImage,
  changePassword,
  updateUserSettings,
  getUserStats,
} from "../features/users/api";

/* =======================================================
   INITIAL STATE
======================================================= */
const initialState = {
  user: null,
  permissions: {},      // ⭐ Dynamic RBAC permissions
  loading: true,

  settingsLoading: false,
  settingsError: null,

  stats: null,
  statsLoading: false,
  statsError: null,
};

/* =======================================================
   HELPER — compute permissions from user role
======================================================= */
function computePermissions(user) {
  if (!user?.role) return {};
  return getPermissions(user.role);
}

/* =======================================================
   LOGIN
======================================================= */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await login({ email, password });

      if (!res.data?.token || !res.data?.user) {
        return rejectWithValue("Invalid login response");
      }

      localStorage.setItem("token", res.data.token);
      /* fire base token */
    const token = await requestFcmToken();

    try {
      if (token) {
        // console.log("FCM Token obtained:", token);
        await http.post("/users/register-fcm-token", { token });
      }
    } catch (fcErr) {
      console.warn("FCM registration failed, but login continues:", fcErr);
    }


      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  }
);

/* =======================================================
   AUTO LOGIN
======================================================= */
export const autoLoginThunk = createAsyncThunk(
  "auth/autoLogin",
  async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await getAuthProfile();

      if (res.data?.token) localStorage.setItem("token", res.data.token);

      return res.data.user;
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  }
);

/* =======================================================
   UPDATE PROFILE
======================================================= */
export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await updateProfile(payload);
      return res.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Update failed");
    }
  }
);

/* =======================================================
   UPDATE IMAGE
======================================================= */
export const updateImageThunk = createAsyncThunk(
  "auth/updateImage",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await updateProfileImage(payload);
      return res.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Image update failed");
    }
  }
);

/* =======================================================
   CHANGE PASSWORD
======================================================= */
export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await changePassword(payload);

      if (res?.token) localStorage.setItem("token", res.token);

      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Password update failed");
    }
  }
);

/* =======================================================
   UPDATE SETTINGS
======================================================= */
export const updateSettingsThunk = createAsyncThunk(
  "auth/updateSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await updateUserSettings(payload);
      return res.settings;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Settings update failed");
    }
  }
);

/* =======================================================
   LOAD STATS
======================================================= */
export const getMyStatsThunk = createAsyncThunk(
  "auth/getMyStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUserStats();
      return res.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to load stats");
    }
  }
);

/* =======================================================
   SLICE
======================================================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.permissions = computePermissions(action.payload);
    },

    logout(state) {
      localStorage.removeItem("token");
      state.user = null;
      state.permissions = {};
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.permissions = computePermissions(action.payload);
        state.loading = false;
      })

      .addCase(autoLoginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.permissions = computePermissions(action.payload);
        state.loading = false;
      })

      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.permissions = computePermissions(action.payload);
      })

      .addCase(updateImageThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(updateSettingsThunk.fulfilled, (state, action) => {
        if (state.user) state.user.settings = action.payload;
      })

      .addCase(getMyStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(changePasswordThunk.fulfilled, (state, action) => {
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.permissions = computePermissions(action.payload.user);
        }
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

/* =======================================================
   SELECTORS (Frontend UI uses these)
======================================================= */

export const selectUser = (state) => state.auth.user;
export const selectPermissions = (state) => state.auth.permissions;

// Dynamic “can I?” selector
export const selectCan = (perm) => (state) =>
  Boolean(state.auth.permissions?.[perm]);

// Explicit selectors
export const selectCanCreateTask = (state) =>
  state.auth.permissions?.canCreateTask ?? false;

export const selectCanAssignTask = (state) =>
  state.auth.permissions?.canAssignTask ?? false;

export const selectCanApproveTask = (state) =>
  state.auth.permissions?.canApproveTask ?? false;

export const selectCanReviseTask = (state) =>
  state.auth.permissions?.canReviseTask ?? false;

export const selectCanDeleteTask = (state) =>
  state.auth.permissions?.canDeleteTask ?? false;

export const selectCanViewAllTasks = (state) =>
  state.auth.permissions?.canViewAllTasks ?? false;

export const selectCanUpdateAnyTask = (state) =>
  state.auth.permissions?.canUpdateAnyTask ?? false;

