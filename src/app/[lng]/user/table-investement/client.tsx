'use client';

import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
import TableInvestement from '@/components/Tables/TableInvestment';

const ClientTableInvestement = ({ lng }: { lng: string }) => {
  const { t } = useTranslation('entreprises');

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={t('my_portfolio')} />
      <div className="flex flex-col gap-4">
        <TableInvestement lng={lng} />
      </div>
    </div>
  );
};

export default ClientTableInvestement;
