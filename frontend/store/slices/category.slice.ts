import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryService, Category, CategoryType, CreateCategoryDto, UpdateCategoryDto } from '@/services/category.service';

/* ================== ASYNC THUNKS ================== */
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (type?: CategoryType) => {
    const response = await categoryService.getAll(type);
    return response;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string) => {
    const response = await categoryService.getById(id);
    return response;
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CreateCategoryDto) => {
    const response = await categoryService.create(data);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: UpdateCategoryDto }) => {
    const response = await categoryService.update(id, data);
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string) => {
    await categoryService.delete(id);
    return id;
  }
);

/* ================== TYPES ================== */
interface CategoryState {
  list: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  loading: boolean;
  error: string | null;
}

/* ================== INITIAL STATE ================== */
const initialState: CategoryState = {
  list: [],
  incomeCategories: [],
  expenseCategories: [],
  loading: false,
  error: null,
};

/* ================== SLICE ================== */
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.list = action.payload;
        state.incomeCategories = action.payload.filter(c => c.type === CategoryType.INCOME);
        state.expenseCategories = action.payload.filter(c => c.type === CategoryType.EXPENSE);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });

    // Fetch category by id
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        } else {
          state.list.push(action.payload);
        }
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch category';
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.list.push(action.payload);
        if (action.payload.type === CategoryType.INCOME) {
          state.incomeCategories.push(action.payload);
        } else {
          state.expenseCategories.push(action.payload);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        
        const incomeIndex = state.incomeCategories.findIndex(c => c.id === action.payload.id);
        const expenseIndex = state.expenseCategories.findIndex(c => c.id === action.payload.id);
        
        if (action.payload.type === CategoryType.INCOME) {
          if (incomeIndex !== -1) {
            state.incomeCategories[incomeIndex] = action.payload;
          } else {
            state.incomeCategories.push(action.payload);
          }
          if (expenseIndex !== -1) {
            state.expenseCategories.splice(expenseIndex, 1);
          }
        } else {
          if (expenseIndex !== -1) {
            state.expenseCategories[expenseIndex] = action.payload;
          } else {
            state.expenseCategories.push(action.payload);
          }
          if (incomeIndex !== -1) {
            state.incomeCategories.splice(incomeIndex, 1);
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
        state.incomeCategories = state.incomeCategories.filter(c => c.id !== action.payload);
        state.expenseCategories = state.expenseCategories.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete category';
      });
  },
});

/* ================== EXPORT ================== */
export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
