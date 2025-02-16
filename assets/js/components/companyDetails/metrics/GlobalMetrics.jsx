import React from 'react';
import RadarChartComponent from '@/components/graphes/RadarChartComponent';
import BarChartMixedComponent from '@/components/graphes/BarChartMixedComponent';
import AreaChartInteractiveComponent from '@/components/graphes/AreaChartInteractiveComponent';
import LineChartLabelComponent from '@/components/graphes/LineChartLabel';

const GlobalMetrics = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <RadarChartComponent />
        <BarChartMixedComponent />
        <LineChartLabelComponent />
      </div>
      <div className="flex gap-6 mb-8">
        <AreaChartInteractiveComponent />
      </div>
    </>
  );
};

export default GlobalMetrics;
