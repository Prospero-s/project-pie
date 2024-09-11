import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientEntreprise = dynamic(() => import('./client'), { ssr: false });

export default function Dashboard() {
  return (
    <DefaultLayout>
      <ClientEntreprise />
    </DefaultLayout>
  );
}
