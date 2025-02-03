import React, { useState, useEffect, useMemo } from "react";
import { fetchGlobalInvestments } from "@/services/investment/investmentService";
import DonutChartComponent from "@/components/graphes/DonutChart";
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function InvestmentGlobalChart() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation("charts");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalInvestments();
      const formattedData = response.map(item => ({
        ...item,
        total_investment: parseFloat(item.total_investment)
      }));
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvestment = useMemo(() => {
    return data.reduce((sum, curr) => sum + (curr.total_investment || 0), 0);
  }, [data]);

  if (isLoading) return <div className="flex justify-center items-center h-[400px]">Chargement des données...</div>;
  if (error) return <div className="flex justify-center items-center h-[400px] text-red-500">{error}</div>;
  if (!data || data.length === 0) return <div className="flex justify-center items-center h-[400px]">Aucune donnée disponible</div>;

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t("investmentGlobalChart.title")}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">{new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <DonutChartComponent 
          data={data}
          valueKey="total_investment"
          nameKey="company_name"
          height={300}
          totalValue={totalInvestment}
          totalLabel={t("investmentGlobalChart.totalInvestment")}
        />
      </CardContent>
    </Card>
  );
}
