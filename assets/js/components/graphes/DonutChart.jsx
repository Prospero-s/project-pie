import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, Legend } from "recharts";

const COLORS = [
  "#297CF7",  // Bleu
  "#12B76A",  // Vert
  "#9f1239",  // Rouge
  "#FF8042",  // Orange
  "#1d4ed8"   // Violet
];

const DonutChartComponent = ({ 
  data, 
  valueKey, 
  nameKey, 
  height = 300,
  totalValue,
  totalLabel = "Total investi"
}) => {
  // Trier les données par valeur décroissante et prendre les 5 premiers
  const sortedData = [...data]
    .sort((a, b) => b[valueKey] - a[valueKey])
    .slice(0, 5)
    .map(item => ({
      ...item,
      [nameKey]: item[nameKey].charAt(0).toUpperCase() + item[nameKey].slice(1).toLowerCase()
    }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={sortedData}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
        >
          {sortedData.map((entry, index) => (
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
                    style={{ fontSize: '20px', fontWeight: 'bold', fill: '#1F2937' }}
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
                    style={{ fontSize: '14px', fill: '#6B7280' }}
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
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          content={({ payload }) => (
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {payload.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center whitespace-nowrap">
                  <div
                    className="w-3 h-3 mr-2 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChartComponent; 