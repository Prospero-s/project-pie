import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { fetchGlobalFundingInvestments } from "@/services/investment/investmentService";

// Tableau de couleurs pour attribuer une couleur à chaque segment
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8"
];

export default function FundingPieChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchGlobalFundingInvestments();

      const formattedData = response.map((item, index) => ({
        fundingType: item.funding_type,
        investment: Number(item.total_investment),
        fill: COLORS[index % COLORS.length],
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
  }, []);

  // Rendu conditionnel en cas de chargement ou d'erreur
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[250px]">
        Chargement des données...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-[250px] text-red-500">
        {error}
      </div>
    );
  if (!chartData || chartData.length === 0)
    return (
      <div className="flex justify-center items-center h-[250px]">
        Aucune donnée disponible
      </div>
    );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Répartition des investissements par type</CardTitle>
        <CardDescription>Période actuelle</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="investment"
                nameKey="fundingType"
                label
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
