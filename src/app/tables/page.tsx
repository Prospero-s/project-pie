import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientTable = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Next.js Tables | TailAdmin - Next.js Dashboard Template',
  description:
    'This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template',
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <ClientTable />
    </DefaultLayout>
  );
};

export default TablesPage;
