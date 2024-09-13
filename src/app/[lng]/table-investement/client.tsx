'use client';

import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/common/Layouts/UserLayout';
import TableInvestement from '@/components/Tables/TableInvestment';

const ClientTableInvestement = ({ lng }: { lng: string }) => {
  const { t } = useTranslation('investement');

  return (
    <DefaultLayout lng={lng}>
      <div className="flex flex-col gap-10">
        <Breadcrumb pageName={t('enteprises')} />
        <div className="flex flex-col gap-10">
          <TableInvestement lng={lng} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ClientTableInvestement;
