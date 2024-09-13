import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import UserLayout from '@/components/common/Layouts/UserLayout';

const ClientSearchCompany = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Search Company',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

const CompanyDetails = ({ lng }: { lng: string }) => {
  return (
    <UserLayout lng={lng}>
      <ClientSearchCompany lng={lng} />
    </UserLayout>
  );
};

export default CompanyDetails;
