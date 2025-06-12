import React, { useState, useEffect } from 'react';
import { fetchGlobalInvestments } from '@/services/investment/investmentService';
import { message } from 'antd';
import DonutChartComponent from '@/components/graphes/DonutChart';
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function InvestmentGlobalChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation('investments');
  const { t: charts } = useTranslation('charts');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalInvestments();
      const formattedData = response.map(item => ({
        ...item,
        total_investment: parseFloat(item.total_investment),
      }));
      setData(formattedData);
      setError(null);
    } catch (error) {
      setError(t('common.error_invalid_data'));
      message.error(`Erreur lors du chargement du document : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvestment = data.reduce(
    (sum, curr) => sum + (curr.total_investment || 0),
    0,
  );

  if (isLoading)
    return (
      <Card className="w-full h-[400px]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {charts('investmentGlobalChart.title')}
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
            {charts('investmentGlobalChart.title')}
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

  if (!data || data.length === 0)
    return (
      <Card className="w-full h-[400px]">
        <CardHeader className="text-center pb-2"></CardHeader>
        <CardContent className="h-[320px] flex flex-col items-center justify-center">
          <div className="text-gray-400 text-center flex flex-col items-center justify-center gap-4">
            <svg
              className="h-[36px] w-[36px]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="#99a1af"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {' '}
                <g>
                  {' '}
                  <path fill="none" d="M0 0H24V24H0z"></path>{' '}
                  <path d="M11 2.05v2.012C7.054 4.554 4 7.92 4 12c0 4.418 3.582 8 8 8 1.849 0 3.55-.627 4.906-1.68l1.423 1.423C16.605 21.153 14.4 22 12 22 6.477 22 2 17.523 2 12c0-5.185 3.947-9.449 9-9.95zM21.95 13c-.2 2.011-.994 3.847-2.207 5.328l-1.423-1.422c.86-1.107 1.436-2.445 1.618-3.906h2.013zM13.002 2.05c4.724.469 8.48 4.226 8.95 8.95h-2.013c-.451-3.618-3.319-6.486-6.937-6.938V2.049z"></path>{' '}
                </g>{' '}
              </g>
            </svg>
            <p className="text-lg font-medium mb-1">{t('no_data.title')}</p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {charts('investmentGlobalChart.title')}
        </CardTitle>
        <CardDescription className="text-gray-500 mt-1">
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[320px]">
        <div className="w-full h-full">
          <DonutChartComponent
            data={data}
            valueKey="total_investment"
            nameKey="company_name"
            height="100%"
            totalValue={totalInvestment}
            totalLabel={charts('investmentGlobalChart.totalInvestment')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
