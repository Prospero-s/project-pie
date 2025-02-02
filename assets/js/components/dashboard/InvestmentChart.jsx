import React, { useState, useEffect } from "react";
import { fetchInvestmentByCompanyIdAndYear } from "@/services/investment/investmentService";
import { Button } from "antd";
import { useParams } from "react-router-dom";
import LineChartComponent from "@/components/graphes/LineChart";
import { useTranslation } from "react-i18next";

const InvestmentChart = () => {
  const { t } = useTranslation("investments");
  const [data, setData] = useState([]);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Tableau des mois avec leur traduction
  const months = [
    { value: "01", label: t("months.january") },
    { value: "02", label: t("months.february") },
    { value: "03", label: t("months.march") },
    { value: "04", label: t("months.april") },
    { value: "05", label: t("months.may") },
    { value: "06", label: t("months.june") },
    { value: "07", label: t("months.july") },
    { value: "08", label: t("months.august") },
    { value: "09", label: t("months.september") },
    { value: "10", label: t("months.october") },
    { value: "11", label: t("months.november") },
    { value: "12", label: t("months.december") }
  ];

  // Fonction de traduction du mois
  const monthTranslation = (month) => {
    const matchingMonth = months.find((m) => m.value === month);
    return matchingMonth ? matchingMonth.label : month;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchInvestmentByCompanyIdAndYear(id, selectedYear);
      const formattedData = response.map(item => ({
        ...item,
        month: monthTranslation(item.month)
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
      
      <div className="shadow-lg rounded-lg p-6 bg-white">
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
            height={350}
          />
        )}
      </div>
    </div>
  );
};

export default InvestmentChart; 