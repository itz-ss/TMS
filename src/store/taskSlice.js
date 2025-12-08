// src/store/taskSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateTask: (state, action) => {
      const index = state.items.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const { setTasks, setLoading, setError, updateTask } = taskSlice.actions;

export const selectPendingTaskCount = (state) =>
  state.tasks.items.filter((t) => t.status === "assigned").length;

export const selectRevisionRequestsCount = (state) =>
  state.tasks.items.filter((t) => t.status === "revisions").length;

export default taskSlice.reducer;

