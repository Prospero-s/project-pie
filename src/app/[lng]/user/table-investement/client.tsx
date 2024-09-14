'use client';

import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
import TableInvestement from '@/components/Tables/TableInvestment';

const ClientTableInvestement = ({ lng }: { lng: string }) => {
  const { t } = useTranslation('investement');

  return (
    <div className="flex flex-col gap-10">
      <Breadcrumb pageName={t('enteprises')} />
      <div className="flex flex-col gap-10">
        <TableInvestement lng={lng} />
      </div>
    </div>
  );
};

export default ClientTableInvestement;
