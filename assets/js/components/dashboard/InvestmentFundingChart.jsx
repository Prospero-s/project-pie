import React, { useState, useEffect } from "react";
import { fetchGlobalFundingInvestments } from "@/services/investment/investmentService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PieChartComponent from "@/components/graphes/PieChart";
import { useTranslation } from "react-i18next";

const InvestmentFundingChart = () => {
  const { t } = useTranslation("investments");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalInvestment, setTotalInvestment] = useState(0);

  // Fonction de traduction des types de financement
  const translateFundingType = (type) => {
    return t(`funding.types.${type}`);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalFundingInvestments();
      const formattedData = response.map((item) => ({
        name: translateFundingType(item.funding_type),
        value: Number(item.total_investment)
      }));
      
      const total = formattedData.reduce((sum, item) => sum + item.value, 0);
      setTotalInvestment(total);
      setChartData(formattedData);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError(t("common.error_invalid_data"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [t]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[400px]">
        {t("common.loading")}
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-[400px] text-red-500">
        {error}
      </div>
    );
  if (!chartData || chartData.length === 0)
    return (
      <div className="flex justify-center items-center h-[400px]">
        {t("no_investments.title")}
      </div>
    );

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t("funding.title")}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <PieChartComponent 
          data={chartData}
          height={300}
          totalValue={totalInvestment}
          totalLabel={t("funding.total")}
        />
      </CardContent>
    </Card>
  );
};

export default InvestmentFundingChart;
