import React, { useState, useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subMonths, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Auth } from 'aws-amplify';

const getInvestmentGrowthRate = (fundingType) => {
  if (!fundingType) return 0.05; // Taux par défaut
  
  switch (fundingType.toLowerCase()) {
    case 'seed': return 0.03;
    case 'seriea': return 0.05;
    case 'serieb': return 0.07;
    case 'seriec': return 0.10;
    case 'growth': return 0.06;
    case 'ipo': return 0.08;
    case 'debt': return 0.04;
    case 'grant': return 0.02;
    default: return 0.05;
  }
};

const InvestmentChart = ({ selectedCompanyId }) => {
  const [chartData, setChartData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateGrowth = (investments) => {
    if (!Array.isArray(investments) || investments.length === 0) {
      return [];
    }

    // Filtrer les investissements pour ne garder que ceux de l'entreprise sélectionnée
    const filteredInvestments = selectedCompanyId 
      ? investments.filter(inv => inv.companyId === selectedCompanyId)
      : investments;

    const monthlyData = new Map();
    const endDate = new Date();
    
    filteredInvestments.forEach(investment => {
      try {
        let currentAmount = parseInt(investment.amount) || 0;
        let currentDate = new Date(investment.investedAt);
        
        if (isNaN(currentDate.getTime())) {
          console.warn('Date invalide:', investment.investedAt);
          return;
        }

        const growthRate = getInvestmentGrowthRate(investment.fundingType);
        
        while (currentDate <= endDate) {
          const monthKey = format(currentDate, 'yyyy-MM');
          const existingAmount = monthlyData.get(monthKey) || 0;
          monthlyData.set(monthKey, existingAmount + currentAmount);
          
          currentAmount = currentAmount * (1 + growthRate);
          currentDate = addMonths(currentDate, 1);
        }
      } catch (err) {
        console.warn('Erreur de traitement pour un investissement:', err);
      }
    });

    return Array.from(monthlyData.entries())
      .map(([monthKey, amount]) => ({
        month: format(new Date(monthKey), 'MMMM yyyy', { locale: fr }),
        amount: Math.round(amount)
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const fetchInvestmentData = async () => {
    try {
      setLoading(true);
      
      const session = await Auth.currentSession();
      const cognitoId = session.getIdToken().payload.sub;
      
      const response = await fetch('/api/investments/chart-data', {
        headers: {
          'x-cognito-id': cognitoId
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || data.error);
      }

      const processedData = calculateGrowth(data);
      setChartData(processedData);
      setError(null);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      setError("Erreur lors du chargement des données");
      setChartData([]); // Réinitialiser les données en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const navigateMonths = (direction) => {
    setCurrentDate(prev => direction === 'next' 
      ? addMonths(prev, 1) 
      : subMonths(prev, 1)
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">Chargement des données...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  if (chartData.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">Aucune donnée disponible</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Évolution des investissements
        </h2>
        <div className="flex gap-4">
          <button 
            onClick={() => navigateMonths('prev')}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            ←
          </button>
          <span className="py-2">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <button 
            onClick={() => navigateMonths('next')}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="shadow-lg rounded-lg p-6 bg-white">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}`}
            />
            <Tooltip 
              formatter={(value) => [
                new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value),
                "Montant"
              ]}
              labelStyle={{ color: "#888888" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentChart; 