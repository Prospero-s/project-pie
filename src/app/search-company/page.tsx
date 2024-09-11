import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientSearchCompany = dynamic(() => import('./client'), { ssr: false });

const CompanyDetails = () => {
  return (
    <DefaultLayout>
      <ClientSearchCompany />
    </DefaultLayout>
  );
};

export default CompanyDetails;
