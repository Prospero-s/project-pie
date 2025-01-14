import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import AddInvestmentModal from '@/components/investements/AddInvestmentModal';
import TableInvestments from '@/components/investements/TableInvestments';
import { useParams } from 'react-router-dom';

const Investments = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Breadcrumb pageName={t('my_portfolio')} />
        <AddInvestmentModal i18n={i18n} />
      </div>
      <div className="flex flex-col gap-4">
        <TableInvestments i18n={i18n} />
      </div>
    </div>
  );
};

export default Investments;
