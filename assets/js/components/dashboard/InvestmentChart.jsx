import React, { useState, useEffect } from "react";
import { fetchInvestmentByCompanyIdAndYear } from "@/services/investment/investmentService";
import { Button } from "antd";
import { useParams } from "react-router-dom";
import LineChartComponent from "@/components/graphes/LineChart";

const InvestmentChart = () => {
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
  }, [selectedYear, id]);

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
          Évolution des investissements {selectedYear}
        </h2>
        <div className="flex gap-2">
          <Button onClick={prevYear}>← Année précédente</Button>
          <Button 
            onClick={nextYear}
            disabled={selectedYear >= currentDate.getFullYear()}
          >
            Année suivante →
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
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[350px] text-gray-500">
            Aucune donnée disponible pour l'année {selectedYear}
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