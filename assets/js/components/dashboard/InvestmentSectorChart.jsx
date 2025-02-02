import React, { useState, useEffect } from "react";
import { fetchGlobalSectorInvestments } from "@/services/investment/investmentService";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8"
];

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
      // Formater les données en traduisant le secteur et en convertissant le total en nombre
      const formattedData = response.map((item, index) => ({
        sector: sectorTranslation(item.sector),
        total_investment: Number(item.total_investment),
        fill: COLORS[index % COLORS.length]
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Investissements par secteur</CardTitle>
        <CardDescription>{new Date().getFullYear()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sector"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value) => `${value.toLocaleString()}€`}
                  labelFormatter={(label) => `Secteur: ${label}`}
                />}
              />
              <Bar
                dataKey="total_investment"
                name="Investissement"
                fill="#0088FE"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InvestmentSectorChart;
