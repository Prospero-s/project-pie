import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PIE_CHART_COLORS } from '@/lib/colors';

const PieChartComponent = ({ data, height = '100%' }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            paddingAngle={1}
            activeShape={false}
            style={{ outline: 'none' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={value =>
              new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(value)
            }
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
