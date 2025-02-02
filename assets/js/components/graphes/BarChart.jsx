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
  valueKey,
  nameKey,
  height = 300,
  barColor = "#0088FE",
  margin = { top: 20, right: 30, left: 40, bottom: 60 },
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
    fill: "#4B5563",
    ...labelProps
  };

  const defaultYAxisProps = {
    tickFormatter: (value) => `${value.toLocaleString()}€`,
    fontSize: 12,
    fill: "#4B5563",
    width: 80,
    ...yAxisProps
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={margin}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={nameKey}
          tick={defaultLabelProps}
          height={60}
          interval={0}
        />
        <YAxis
          {...defaultYAxisProps}
          tick={{ fontSize: defaultYAxisProps.fontSize, fill: defaultYAxisProps.fill }}
          tickFormatter={defaultYAxisProps.tickFormatter}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={tooltipLabelFormatter}
          contentStyle={{ fontSize: "12px" }}
        />
        <Bar
          dataKey={valueKey}
          name={barName}
          fill={barColor}
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent; 