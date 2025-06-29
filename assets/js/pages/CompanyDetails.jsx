import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCompanyDetailsById } from '@/services/company/companyService';
import { Card, Tabs } from 'antd';
import AllMetrics from '@/components/companyDetails/metrics/AllMetrics';
import InvestmentDetails from '@/components/companyDetails/metrics/InvestmentDetails';
import GlobalMetrics from '@/components/companyDetails/metrics/GlobalMetrics';

const CompanyDetails = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const { t: metrics } = useTranslation('metrics', { i18n });
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
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">
        {t('company_details.title')} : {company.denomination}
      </h2>
      <Card className="shadow-lg rounded-lg">
        <Tabs
          destroyInactiveTabPane={false}
          items={[
            {
              key: '1',
              label: metrics('all_metrics'),
              children: <AllMetrics />,
            },
            {
              key: '2',
              label: metrics('global_metrics'),
              children: <GlobalMetrics />,
            },
            {
              key: '3',
              label: metrics('documents'),
              children: <AllMetrics />,
            },
            {
              key: '4',
              label: metrics('investment_details'),
              children: <InvestmentDetails />,
            },
            {
              key: '5',
              label: metrics('all_metrics'),
              children: <AllMetrics />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CompanyDetails;
