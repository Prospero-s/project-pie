'use client';

import { useTranslation } from 'react-i18next';

import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
import AddEntrepriseModal from '@/components/Entreprise/AddEntrepriseModal';
import TableInvestement from '@/components/Tables/TableInvestment';

const ClientTableInvestement = ({ lng }: { lng: string }) => {
  const { t } = useTranslation('entreprises');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Breadcrumb pageName={t('my_portfolio')} />
        <AddEntrepriseModal />
      </div>
      <div className="flex flex-col gap-4">
        <TableInvestement lng={lng} />
      </div>
    </div>
  );
};

export default ClientTableInvestement;
