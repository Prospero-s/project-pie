import { createSlice } from '@reduxjs/toolkit';

// Default layout configuration for the charts
const initialLayout = {
  radar: { i: 'radar', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 1, maxW: 3 },
  barMixed: {
    i: 'barMixed',
    x: 1,
    y: 0,
    w: 1,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
  lineLabel: {
    i: 'lineLabel',
    x: 2,
    y: 0,
    w: 1,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
  areaInteractive: {
    i: 'areaInteractive',
    x: 0,
    y: 2,
    w: 3,
    h: 2,
    minW: 1,
    minH: 1,
    maxW: 3,
  },
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    // Store layouts by company ID
    layoutsByCompany: {},
    // Default layout used when no company-specific layout exists
    defaultLayout: initialLayout,
    // Custom charts added from queries
    customCharts: {},
    cols: 3,
    rowHeight: 200,
    isDraggable: true,
    isResizable: true,
  },
  reducers: {
    updateLayouts: (state, action) => {
      const { companyId, layouts } = action.payload;
      if (companyId) {
        // Set the layouts for the specific company
        state.layoutsByCompany[companyId] = layouts;
      } else {
        // Fall back to updating default layout if no companyId is provided
        state.defaultLayout = layouts;
      }
    },
    addCustomChart: (state, action) => {
      const {
        companyId,
        chartId,
        chartData,
        chartType,
        title,
        columnsMetadata,
      } = action.payload;

      // Store chart data
      if (!state.customCharts[companyId]) {
        state.customCharts[companyId] = {};
      }

      state.customCharts[companyId][chartId] = {
        data: chartData,
        type: chartType,
        title: title,
        columnsMetadata: columnsMetadata || {},
      };

      // Add to layout
      const currentLayout =
        companyId && state.layoutsByCompany[companyId]
          ? { ...state.layoutsByCompany[companyId] }
          : { ...state.defaultLayout };

      // Find available Y position (place chart below existing ones)
      let maxY = 0;
      Object.values(currentLayout).forEach(item => {
        const itemBottom = item.y + item.h;
        if (itemBottom > maxY) maxY = itemBottom;
      });

      // Add chart to layout
      currentLayout[chartId] = {
        i: chartId,
        x: 0,
        y: maxY,
        w: 3,
        h: 2,
        minW: 1,
        minH: 1,
        maxW: 3,
      };

      // Update layout
      if (companyId) {
        state.layoutsByCompany[companyId] = currentLayout;
      } else {
        state.defaultLayout = currentLayout;
      }
    },
    removeCustomChart: (state, action) => {
      const { companyId, chartId } = action.payload;

      // Remove chart data
      if (
        state.customCharts[companyId] &&
        state.customCharts[companyId][chartId]
      ) {
        delete state.customCharts[companyId][chartId];
      }

      // Remove from layout
      const currentLayout =
        companyId && state.layoutsByCompany[companyId]
          ? { ...state.layoutsByCompany[companyId] }
          : { ...state.defaultLayout };

      if (currentLayout[chartId]) {
        delete currentLayout[chartId];

        // Update layout
        if (companyId) {
          state.layoutsByCompany[companyId] = currentLayout;
        } else {
          state.defaultLayout = currentLayout;
        }
      }
    },
    updateCols: (state, action) => {
      state.cols = action.payload;
    },
    updateRowHeight: (state, action) => {
      state.rowHeight = action.payload;
    },
    toggleDraggable: state => {
      state.isDraggable = !state.isDraggable;
    },
    toggleResizable: state => {
      state.isResizable = !state.isResizable;
    },
  },
});

export const {
  updateLayouts,
  addCustomChart,
  removeCustomChart,
  updateCols,
  updateRowHeight,
  toggleDraggable,
  toggleResizable,
} = layoutSlice.actions;

export default layoutSlice.reducer;
