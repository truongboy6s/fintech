import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import transactionReducer from './slices/transaction.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
