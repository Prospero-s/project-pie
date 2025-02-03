import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import InvestmentChart from '@/components/companyDetails/InvestmentChart';
import { getCompanyDetailsById } from '@/services/company/companyService';
import { Card } from 'antd';

const CompanyDetails = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentData();
  }, [id]);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      const response = await getCompanyDetailsById(id); // Fix later
      setCompany(response);
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
        {t('company_details.title')} : {company.denomination}
      </h2>

      <Card className="shadow-lg rounded-lg">
        <InvestmentChart />
      </Card>
    </div>
  );
};

export default CompanyDetails; 