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

const InvestmentSectorChart = () => {
  const { t } = useTranslation("investments");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tableau des secteurs avec leur traduction
  const sectors = [
    { value: "technology", label: t("company_details.sectors.technology") },
    { value: "healthcare", label: t("company_details.sectors.healthcare") },
    { value: "finance", label: t("company_details.sectors.finance") },
    { value: "retail", label: t("company_details.sectors.retail") },
    { value: "manufacturing", label: t("company_details.sectors.manufacturing") },
    { value: "energy", label: t("company_details.sectors.energy") },
    { value: "education", label: t("company_details.sectors.education") },
    { value: "other", label: t("company_details.sectors.other") },
  ];

  // Fonction de traduction du secteur
  const sectorTranslation = (sector) => {
    const matchingSector = sectors.find((s) => s.value === sector);
    return matchingSector ? matchingSector.label : sector;
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalSectorInvestments();
      const formattedData = response.map((item) => ({
        sector: sectorTranslation(item.sector),
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
          Investissements par secteur
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <BarChartComponent 
          data={chartData}
          valueKey="total_investment"
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

export default InvestmentSectorChart;
