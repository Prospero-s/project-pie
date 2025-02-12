import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const BarChartComponent = ({
  data,
  dataKey,
  nameKey,
  height = 300,
  barColor = "#297CF7",
  margin = { top: 20, right: 20, left: 50, bottom: 70 },
  tooltipFormatter = (value) => `${value.toLocaleString()}€`,
  tooltipLabelFormatter = (label) => `${label}`,
  barName = "Valeur",
  labelProps = {},
  yAxisProps = {}
}) => {
  const defaultLabelProps = {
    position: "bottom",
    angle: -45,
    textAnchor: "end",
    fontSize: 12,
    fill: "#6B7280",
    dy: 10,
    ...labelProps
  };

  const defaultYAxisProps = {
    tickFormatter: (value) => `${value.toLocaleString()}€`,
    fontSize: 12,
    fill: "#6B7280",
    width: 80,
    ...yAxisProps
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ ...margin, bottom: Math.max(margin.bottom, 40) }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey={nameKey}
            tick={{ ...defaultLabelProps, fontSize: 'clamp(10px, 1.2vw, 12px)' }}
            height={1}
            width={0}
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            {...defaultYAxisProps}
            tick={{ fontSize: 'clamp(10px, 1.2vw, 12px)' }}
            tickFormatter={defaultYAxisProps.tickFormatter}
            axisLine={false}
            tickLine={false}
            width={1}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
            contentStyle={{ 
              fontSize: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            cursor={{ fill: 'rgba(41, 124, 247, 0.1)' }}
          />
          <Bar
            dataKey={dataKey}
            name={barName}
            fill={barColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent; 