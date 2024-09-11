import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientDashboard = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Project PIE Dashboard',
  description: 'This is Next.js with TailAdmin Dashboard Template',
};

export default function Dashboard() {
  return (
    <DefaultLayout>
      <ClientDashboard />
    </DefaultLayout>
  );
}
