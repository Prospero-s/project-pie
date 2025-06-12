import React, { useState, useEffect } from 'react';
import { fetchGlobalSectorInvestments } from '@/services/investment/investmentService';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import BarChartComponent from '@/components/graphes/BarChart';
import { sectorTranslation } from '@/services/graphe/grapheService';
import { BarChartOutlined } from '@ant-design/icons';

const InvestmentGlobalSectorChart = () => {
  const { t } = useTranslation('investments');
  const { t: charts } = useTranslation('charts');
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalSectorInvestments();
      const formattedData = response.map(item => ({
        sector: sectorTranslation(t, item.sector),
        total_investment: Number(item.total_investment),
      }));
      setChartData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [t]);

  if (isLoading)
    return (
      <Card className="w-full h-[400px]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {charts('investmentGlobalSectorChart.title')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg
              className="mx-auto h-12 w-12 mb-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-lg font-medium">{t('common.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card className="w-full h-[400px]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {charts('investmentGlobalSectorChart.title')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] flex flex-col items-center justify-center">
          <div className="text-red-500 text-center">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-lg font-medium mb-1">{t('common.error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  if (!chartData || chartData.length === 0)
    return (
      <Card className="w-full h-[400px]">
        <CardHeader className="text-center pb-2"></CardHeader>
        <CardContent className="h-[320px] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-center flex flex-col items-center justify-center gap-4">
            <BarChartOutlined className="text-4xl" />
            <p className="text-lg font-medium mb-1">{t('no_data.title')}</p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {charts('investmentGlobalSectorChart.title')}
        </CardTitle>
        <CardDescription className="text-gray-500 mt-1">
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <div className="w-full h-full">
          <BarChartComponent
            data={chartData}
            dataKey="total_investment"
            nameKey="sector"
            height="100%"
            tooltipLabelFormatter={label => `Secteur: ${label}`}
            barName="Investissement"
            margin={{ top: 20, right: 30, left: 60, bottom: 70 }}
            labelProps={{
              position: 'bottom',
              angle: -45,
              textAnchor: 'end',
              fontSize: 12,
              fill: '#4B5563',
              dy: 10,
            }}
            yAxisProps={{
              tickFormatter: value => `${value}€`,
              fontSize: 12,
              fill: '#4B5563',
              width: 80,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentGlobalSectorChart;
