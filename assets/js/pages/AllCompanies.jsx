import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import TableCompanies from '@/components/companies/TableCompanies';
import { useParams } from 'react-router-dom';

const AllCompanies = () => {
  const { t, i18n } = useTranslation('allCompanies');
  const { lng } = useParams();

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Breadcrumb pageName={t('list_companies')} />
      </div>
      <div className="flex flex-col gap-4">
        <TableCompanies i18n={i18n} />
      </div>
    </div>
  );
};

export default AllCompanies;
