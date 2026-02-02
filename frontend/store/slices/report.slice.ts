import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportService, MonthlyReport, CategoryReport, TrendReport } from '../../services/report.service';

interface ReportState {
  monthlyReport: MonthlyReport | null;
  categoryReports: { [categoryId: string]: CategoryReport };
  trendReport: TrendReport[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  monthlyReport: null,
  categoryReports: {},
  trendReport: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMonthlyReport = createAsyncThunk(
  'report/fetchMonthlyReport',
  async ({ year, month }: { year?: number; month?: number }) => {
    return await reportService.getMonthlyReport(year, month);
  }
);

export const fetchCategoryReport = createAsyncThunk(
  'report/fetchCategoryReport',
  async ({ categoryId, startDate, endDate }: { categoryId: string; startDate?: string; endDate?: string }) => {
    return await reportService.getCategoryReport(categoryId, startDate, endDate);
  }
);

export const fetchTrendReport = createAsyncThunk(
  'report/fetchTrendReport',
  async (months?: number) => {
    return await reportService.getTrendReport(months);
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
    },
    clearReports: (state) => {
      state.monthlyReport = null;
      state.categoryReports = {};
      state.trendReport = [];
      state.selectedCategoryId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch monthly report
    builder
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyReport = action.payload;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Không thể tải báo cáo tháng';
      });

    // Fetch category report
    builder
      .addCase(fetchCategoryReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryReport.fulfilled, (state, action) => {
        state.loading = false;
        const categoryId = action.payload.category.id;
        state.categoryReports[categoryId] = action.payload;
      })
      .addCase(fetchCategoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Không thể tải báo cáo danh mục';
      });

    // Fetch trend report
    builder
      .addCase(fetchTrendReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendReport.fulfilled, (state, action) => {
        state.loading = false;
        state.trendReport = action.payload;
      })
      .addCase(fetchTrendReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Không thể tải báo cáo xu hướng';
      });
  },
});

export const { setSelectedCategory, clearReports } = reportSlice.actions;
export default reportSlice.reducer;
