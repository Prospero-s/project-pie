'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from 'recharts';
import { BAR_CHART_COLORS } from '@/lib/colors';

export function ChartBarLabelCustom({
  data,
  tooltipFormatter = value => `${value.toLocaleString()}€`,
  tooltipLabelFormatter = label => `${label}`,
}) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 30,
            bottom: 10,
            left: 10,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="month"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={value => value.slice(0, 3)}
            hide
          />
          <XAxis dataKey="investissements" type="number" hide />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
            contentStyle={{
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            cursor={{ fill: 'rgba(41, 124, 247, 0.1)' }}
          />
          <Bar
            dataKey="investissements"
            layout="vertical"
            radius={4}
            barSize={30}
          >
            <LabelList
              dataKey="month"
              position="insideLeft"
              offset={8}
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
            />
            <LabelList
              dataKey="investissements"
              position="right"
              offset={8}
              fill="#000000"
              fontSize={12}
              fontWeight="bold"
            />
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_CHART_COLORS(entry.month)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
