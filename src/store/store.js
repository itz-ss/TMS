import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import userReducer from './userSlice';
import notificationReducer from './notificationSlice';
import taskReducer from './taskSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    notifications: notificationReducer,
    tasks: taskReducer,
  },
});

export default store;
