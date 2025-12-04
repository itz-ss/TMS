// Optional: For user-specific state, e.g. user list, roles, etc.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../services/httpClient';

const initialState = {
  users: [],
  roles: [],
  loading: false,
};

export const fetchUsersThunk = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/users');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Fetch users failed');
    }
  }
);

export const fetchRolesThunk = createAsyncThunk(
  'user/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/roles');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Fetch roles failed');
    }
  }
);

export const changeUserRoleThunk = createAsyncThunk(
  'user/changeRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/users/${userId}/role`, { role });
      // backend returns { message, user }
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to change role');
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsersThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.roles = action.payload;
      })
      .addCase(changeUserRoleThunk.fulfilled, (state, action) => {
        // Update user in the list with new role
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        // Remove deleted user from list
        state.users = state.users.filter(u => u._id !== action.payload);
      });
  },
});

export default userSlice.reducer;
