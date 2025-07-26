import React from 'react';
import { useParams } from 'react-router-dom';
import InvestmentChart from '@/components/companyDetails/metrics/InvestmentChart';
import CompanyInvestmentsTable from '@/components/companyDetails/metrics/CompanyInvestmentsTable';
import { useTranslation } from 'react-i18next';

const InvestmentDetails = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Graphique d'évolution des investissements */}
      <InvestmentChart />

      {/* Tableau des investissements avec possibilité de modification */}
      <CompanyInvestmentsTable companyId={id} i18n={i18n} />
    </div>
  );
};

export default InvestmentDetails;
