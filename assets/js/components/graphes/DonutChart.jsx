import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';

const COLORS = [
  '#297CF7', // Bleu
  '#12B76A', // Vert
  '#9f1239', // Rouge
  '#FF8042', // Orange
  '#1d4ed8', // Violet
];

const DonutChartComponent = ({
  data,
  valueKey,
  nameKey,
  height,
  totalValue,
  totalLabel = 'Total investi',
}) => {
  // Trier les données par valeur décroissante et prendre les 5 premiers
  const sortedData = [...data]
    .sort((a, b) => b[valueKey] - a[valueKey])
    .slice(0, 5)
    .map(item => ({
      ...item,
      [nameKey]:
        item[nameKey].charAt(0).toUpperCase() +
        item[nameKey].slice(1).toLowerCase(),
    }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={sortedData}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            activeShape={false}
            style={{ outline: 'none' }}
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
                  <g transform={`translate(${cx},${cy})`}>
                    <text
                      y={-8}
                      dominantBaseline="central"
                      textAnchor="middle"
                      style={{ fontSize: 'clamp(12px, 1.2vw, 14px)' }}
                    >
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(totalValue)}
                    </text>
                    <text
                      y={12}
                      dominantBaseline="central"
                      textAnchor="middle"
                      style={{ fontSize: 'clamp(10px, 1vw, 12px)' }}
                    >
                      {totalLabel}
                    </text>
                  </g>
                );
              }}
            />
          </Pie>
          <Tooltip
            formatter={value =>
              new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(value)
            }
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChartComponent;
