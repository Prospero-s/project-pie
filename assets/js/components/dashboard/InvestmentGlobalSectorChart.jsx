import React, { useState, useEffect } from "react";
import { fetchGlobalSectorInvestments } from "@/services/investment/investmentService";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BarChartComponent from "@/components/graphes/BarChart";
import { sectorTranslation } from "@/services/graphe/grapheService";

const InvestmentGlobalSectorChart = () => {
  const { t } = useTranslation("investments");
  const { t: charts } = useTranslation("charts");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalSectorInvestments();
      const formattedData = response.map((item) => ({
        sector: sectorTranslation(t, item.sector),
        total_investment: Number(item.total_investment)
      }));
      setChartData(formattedData);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors du chargement des données");
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
        Chargement des données...
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
        Aucune donnée disponible
      </div>
    );

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {charts("investmentGlobalSectorChart.title")}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <BarChartComponent 
          data={chartData}
          dataKey="total_investment"
          nameKey="sector"
          height={300}
          tooltipLabelFormatter={(label) => `Secteur: ${label}`}
          barName="Investissement"
          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
          labelProps={{
            position: "bottom",
            angle: -45,
            textAnchor: "end",
            fontSize: 12,
            fill: "#4B5563"
          }}
          yAxisProps={{
            tickFormatter: (value) => `${value}€`,
            fontSize: 12,
            fill: "#4B5563"
          }}
        />
      </CardContent>
    </Card>
  );
};

export default InvestmentGlobalSectorChart;
