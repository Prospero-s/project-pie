import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { updateLayouts, removeCustomChart } from '../../../redux/slices/layoutSlice';
import RadarChartComponent from '@/components/graphes/RadarChartComponent';
import BarChartMixedComponent from '@/components/graphes/BarChartMixedComponent';
import AreaChartInteractiveComponent from '@/components/graphes/AreaChartInteractiveComponent';
import LineChartLabelComponent from '@/components/graphes/LineChartLabel';
import CustomChartComponent from './customCharts/CustomChartComponent';
import { CloseOutlined } from '@ant-design/icons';
import GridControls from './GridControls';
import '../../../../css/components/metrics.css';

// Import required CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const GlobalMetrics = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { id } = useParams(); // Get the company ID from URL
  const { layoutsByCompany, defaultLayout, customCharts, cols, rowHeight, isDraggable, isResizable } = useSelector((state) => state.layout);

  // Use company-specific layout if available, otherwise use default layout
  const currentLayout = id && layoutsByCompany[id] ? layoutsByCompany[id] : defaultLayout;

  // Convert the layout object to an array format required by react-grid-layout
  const layoutArray = Object.values(currentLayout);
  
  // Get custom charts for this company
  const companyCustomCharts = id && customCharts[id] ? Object.keys(customCharts[id]) : [];

  // Handle layout changes
  const handleLayoutChange = (layout) => {
    // Convert the array layout back to object format for Redux
    const updatedLayouts = {};
    
    layout.forEach(item => {
      // Preserve minW, minH, and maxW properties from the current layout
      const currentItem = currentLayout[item.i];
      updatedLayouts[item.i] = {
        ...item,
        minW: currentItem?.minW ?? 1,
        minH: currentItem?.minH ?? 1,
        maxW: currentItem?.maxW ?? 3
      };
    });
    
    // Update the layout with company ID
    dispatch(updateLayouts({
      companyId: id,
      layouts: updatedLayouts
    }));
  };
  
  // Handle removing a custom chart
  const handleRemoveChart = (chartId) => {
    dispatch(removeCustomChart({
      companyId: id,
      chartId
    }));
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <GridControls />
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layoutArray }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: cols, md: 3, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={rowHeight}
        isDraggable={isDraggable}
        isResizable={isResizable}
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        useCSSTransforms={true}
      >
        <div key="radar" className="chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm">
          <RadarChartComponent />
        </div>
        <div key="barMixed" className="chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm">
          <BarChartMixedComponent />
        </div>
        <div key="lineLabel" className="chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm">
          <LineChartLabelComponent />
        </div>
        <div key="areaInteractive" className="chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm">
          <AreaChartInteractiveComponent />
        </div>
        
        {/* Render custom charts */}
        {companyCustomCharts.map(chartId => (
          <div 
            key={chartId} 
            className="chart-container rounded-lg border bg-card border-slate-300 text-card-foreground shadow-sm"
          >
            <div 
              className="chart-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveChart(chartId);
              }}
            >
              <CloseOutlined />
            </div>
            <CustomChartComponent chartId={chartId} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </>
  );
};

export default GlobalMetrics;
