import { configureStore } from '@reduxjs/toolkit';
import layoutReducer from '../slices/layoutSlice';

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
  },
});

export default store; 