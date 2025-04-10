import React from 'react';
import { useTranslation } from 'react-i18next';
import FinancialDataViewer from '../components/FinancialDataViewer';

const FinancialExtraction = () => {
  const { t } = useTranslation('board_pack');

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">{t('title')}</h1>
          <p className="lead mb-4">{t('description')}</p>
          <FinancialDataViewer />
        </div>
      </div>
    </div>
  );
};

export default FinancialExtraction;
