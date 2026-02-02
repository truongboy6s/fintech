import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { budgetService, Budget, CreateBudgetDto, UpdateBudgetDto } from '@/services/budget.service';

/* ================== ASYNC THUNKS ================== */
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async () => {
    const response = await budgetService.getAll();
    return response;
  }
);

export const fetchBudgetById = createAsyncThunk(
  'budgets/fetchById',
  async (id: string) => {
    const response = await budgetService.getById(id);
    return response;
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data: CreateBudgetDto) => {
    const response = await budgetService.create(data);
    return response;
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: string; data: UpdateBudgetDto }) => {
    const response = await budgetService.update(id, data);
    return response;
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id: string) => {
    await budgetService.delete(id);
    return id;
  }
);

/* ================== TYPES ================== */
interface BudgetState {
  list: Budget[];
  loading: boolean;
  error: string | null;
}

/* ================== INITIAL STATE ================== */
const initialState: BudgetState = {
  list: [],
  loading: false,
  error: null,
};

/* ================== SLICE ================== */
const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all budgets
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      });

    // Fetch budget by id
    builder
      .addCase(fetchBudgetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgetById.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        } else {
          state.list.push(action.payload);
        }
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budget';
      });

    // Create budget
    builder
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create budget';
      });

    // Update budget
    builder
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.loading = false;
        const index = state.list.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update budget';
      });

    // Delete budget
    builder
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.list = state.list.filter(b => b.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete budget';
      });
  },
});

/* ================== EXPORT ================== */
export const { clearError } = budgetSlice.actions;
export default budgetSlice.reducer;
