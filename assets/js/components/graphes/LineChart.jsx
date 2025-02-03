import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const LineChartComponent = ({ data, xDataKey, yDataKey, height = 350 }) => {
  // Calculer la valeur max pour l'axe Y
  const maxValue = Math.max(...data.map(item => item[yDataKey]));
  const padding = maxValue * 0.1; // 10% de padding au-dessus de la valeur max

  // Formater les grands nombres
  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`;
    return `${value}€`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xDataKey}
          stroke="#181D27"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#1d4ed8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
          domain={[0, maxValue + padding]}
          allowDataOverflow={false}
        />
        <Tooltip
          formatter={(value) => [`${value.toLocaleString()}€`, "Montant"]}
          labelStyle={{ color: "#888888" }}
        />
        <Line
          type="monotone"
          dataKey={yDataKey}
          stroke="#12B76A"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;