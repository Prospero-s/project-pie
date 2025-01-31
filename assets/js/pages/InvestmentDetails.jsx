import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import InvestmentChart from '@/components/dashboard/InvestmentChart';
import { fetchInvestmentById } from '@/services/investment/investmentService';
import { Card } from 'antd';

const InvestmentDetails = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const { id } = useParams();
  const [investment, setInvestment] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentData();
  }, [id]);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      console.log("Chargement de l'investissement avec l'ID:", id);
      const data = await fetchInvestmentById(id);
      console.log("Data reçue:", data);
      
      setInvestment(data);
      
      // Vérifions la structure exacte des données
      console.log("Structure de l'investissement:", {
        amount: data?.amount,
        investment: data?.investment,
        company: data?.company
      });
      
      // Essayons d'abord data.amount puis data.investment.amount
      const amount = data?.amount || data?.investment?.amount;
      if (amount) {
        generateChartData(Number(amount));
      } else {
        console.error("Montant non trouvé dans les données:", data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (baseAmount) => {
    const months = [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];
    
    let currentAmount = baseAmount;
    const data = months.map((month, index) => {
      // Pour janvier, utiliser le montant exact
      if (index === 0) {
        return {
          month,
          amount: currentAmount,
          trend: 0
        };
      }
      
      // Pour les autres mois, calculer une variation
      const variation = ((Math.random() * 0.4) - 0.2);
      currentAmount = currentAmount * (1 + variation);
      
      return {
        month,
        amount: Math.round(currentAmount),
        trend: Math.round(variation * 100)
      };
    });

    setChartData(data);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">
        Investissement dans {investment?.company?.denomination}
      </h2>

      <Card className="shadow-lg rounded-lg">
        <InvestmentChart 
          selectedCompanyId={investment?.company?.id}
        />
      </Card>
    </div>
  );
};

export default InvestmentDetails; 