import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  note?: string;
  date: string;
}
interface TransactionState {
  list: Transaction[];
}
const initialState: TransactionState = {
  list: [],
};
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction(
      state,
      action: PayloadAction<Transaction>
    ) {
      state.list.push(action.payload);
    },
  },
});

export const { addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
