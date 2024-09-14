import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientSearchCompany = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Search Company',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

const CompanyDetails = ({ params: { lng } }: { params: { lng: string } }) => {
  return <ClientSearchCompany lng={lng} />;
};

export default CompanyDetails;
