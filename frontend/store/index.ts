import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import transactionReducer from './slices/transaction.slice';
import categoryReducer from './slices/category.slice';
import budgetReducer from './slices/budget.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    budgets: budgetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
