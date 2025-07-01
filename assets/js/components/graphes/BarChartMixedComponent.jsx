import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const chartData = [
  { browser: 'chrome', visitors: 275, fill: '#2563EB' },
  { browser: 'safari', visitors: 200, fill: '#60A8FB' },
  { browser: 'firefox', visitors: 187, fill: '#3B86F7' },
  { browser: 'edge', visitors: 173, fill: '#90C6FE' },
  { browser: 'other', visitors: 90, fill: '#BDDCFE' },
];

const BarChartMixedComponent = () => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center">
        <CardTitle>Bar Chart - Mixed</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-center items-center h-full">
          <BarChart
            width={300}
            height={200}
            data={chartData}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="visitors" type="number" hide />
            <Tooltip />
            <Bar
              dataKey="visitors"
              radius={5}
              fill={({ payload }) => payload.fill}
            />
          </BarChart>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default BarChartMixedComponent;
