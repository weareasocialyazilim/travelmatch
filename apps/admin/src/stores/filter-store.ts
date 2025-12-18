import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  // User filters
  userFilters: {
    status?: string;
    kyc_status?: string;
    search?: string;
  };

  // Task filters
  taskFilters: {
    status?: string;
    priority?: string;
    type?: string;
    assigned_to?: string;
  };

  // Report filters
  reportFilters: {
    status?: string;
    priority?: string;
    type?: string;
  };

  // Moment filters
  momentFilters: {
    status?: string;
    featured?: boolean;
  };

  // Date range
  dateRange: {
    from?: string;
    to?: string;
  };

  // Actions
  setUserFilters: (filters: FilterState['userFilters']) => void;
  setTaskFilters: (filters: FilterState['taskFilters']) => void;
  setReportFilters: (filters: FilterState['reportFilters']) => void;
  setMomentFilters: (filters: FilterState['momentFilters']) => void;
  setDateRange: (range: FilterState['dateRange']) => void;
  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      userFilters: {},
      taskFilters: {},
      reportFilters: {},
      momentFilters: {},
      dateRange: {},

      setUserFilters: (filters) => set({ userFilters: filters }),
      setTaskFilters: (filters) => set({ taskFilters: filters }),
      setReportFilters: (filters) => set({ reportFilters: filters }),
      setMomentFilters: (filters) => set({ momentFilters: filters }),
      setDateRange: (range) => set({ dateRange: range }),

      clearAllFilters: () =>
        set({
          userFilters: {},
          taskFilters: {},
          reportFilters: {},
          momentFilters: {},
          dateRange: {},
        }),
    }),
    {
      name: 'admin-filters',
      partialize: (state) => ({
        // Only persist certain filters
        taskFilters: state.taskFilters,
        dateRange: state.dateRange,
      }),
    }
  )
);
