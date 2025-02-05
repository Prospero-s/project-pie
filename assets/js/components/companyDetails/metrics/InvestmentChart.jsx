import React, { useState, useEffect } from "react";
import { fetchInvestmentByCompanyIdAndYear } from "@/services/investment/investmentService";
import { Button } from "antd";
import { useParams } from "react-router-dom";
import LineChartComponent from "@/components/graphes/LineChart";
import { useTranslation } from "react-i18next";
import { monthTranslation } from "@/services/graphe/grapheService";

const InvestmentChart = () => {
  const { t } = useTranslation("charts");
  const [data, setData] = useState([]);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchInvestmentByCompanyIdAndYear(id, selectedYear);
      const formattedData = response.map(item => ({
        ...item,
        month: monthTranslation(t, item.month)
      }));
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError(t("common.error_invalid_data"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, id, t]);

  const nextYear = () => {
    const nextYear = selectedYear + 1;
    if (nextYear <= currentDate.getFullYear()) {
      setSelectedYear(nextYear);
    }
  };

  const prevYear = () => {
    setSelectedYear(prevYear => prevYear - 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {t("chart.investment_evolution")} {selectedYear}
        </h2>
        <div className="flex gap-2">
          <Button onClick={prevYear}>{t("chart.previous_year")}</Button>
          <Button 
            onClick={nextYear}
            disabled={selectedYear >= currentDate.getFullYear()}
          >
            {t("chart.next_year")}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[350px]">
          {t("common.loading")}
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[350px] text-red-500">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex justify-center items-center h-[350px] text-gray-500">
          {t("chart.no_data_for_year", { year: selectedYear })}
        </div>
      ) : (
        <LineChartComponent 
          data={data} 
          xDataKey="month" 
          yDataKey="investment"
          height={200}
        />
      )}
    </div>
  );
};

export default InvestmentChart; 