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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentData();
  }, [id]);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      const data = await fetchInvestmentById(id);
      setInvestment(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
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
        <InvestmentChart />
      </Card>
    </div>
  );
};

export default InvestmentDetails; 