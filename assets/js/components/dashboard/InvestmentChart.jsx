import React, { useState, useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchInvestmentByCompanyIdAndYear } from "../../services/investment/investmentService";
import { subMonths, addMonths } from "date-fns";
import { Button } from "antd";
import { useParams } from "react-router-dom";

const InvestmentChart = () => {
  const [data, setData] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetchInvestmentByCompanyIdAndYear(
        id,
        currentYear
      );
      
      console.log(response);

      setData(response);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentYear]);

  const navigateMonths = (direction) => {
    setCurrentDate(prev => {
      if (direction === "previous") {
        return subMonths(prev, 6);
      } else {
        return addMonths(prev, 6);
      }
    });
  };

  const nextYear = () => {
      setCurrentYear(prevYear => prevYear + 1);
  };

  const prevYear = () => {
      setCurrentYear(prevYear => prevYear - 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Évolution des investissements
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => navigateMonths("previous")}
            variant="outline"
            size="sm"
          >
            ← 6 mois
          </Button>
          <Button
            onClick={() => navigateMonths("next")}
            variant="outline"
            size="sm"
          >
            6 mois →
          </Button>
        </div>
      </div>
      
      <div className="shadow-lg rounded-lg p-6 bg-white">
        {isLoading ? (
          <div className="flex justify-center items-center h-[350px]">
            Chargement...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[350px] text-red-500">
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                dataKey="investment"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()}€`, "Montant"]}
                labelStyle={{ color: "#888888" }}
              />
              <Line
                type="monotone"
                dataKey="investment"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default InvestmentChart; 