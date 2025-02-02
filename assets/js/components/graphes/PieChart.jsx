import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";

const COLORS = [
  "#0088FE",  // Bleu
  "#00C49F",  // Vert
  "#FFBB28",  // Jaune
  "#FF8042",  // Orange
  "#8884d8"   // Violet
];

const PieChartComponent = ({ 
  data, 
  valueKey, 
  nameKey, 
  height = 300,
  totalValue,
  totalLabel = "Total"
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          label={(entry) => entry[nameKey]}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
          <Label
            position="center"
            content={({ viewBox }) => {
              const { cx, cy } = viewBox;
              return (
                <>
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xl font-bold fill-gray-900"
                  >
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(totalValue)}
                  </text>
                  <text
                    x={cx}
                    y={cy + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm fill-gray-500"
                  >
                    {totalLabel}
                  </text>
                </>
              );
            }}
          />
        </Pie>
        <Tooltip
          formatter={(value) => new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent; 