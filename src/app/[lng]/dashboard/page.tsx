import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientDashboard = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Project PIE Dashboard',
  description: 'This is Next.js with TailAdmin Dashboard Template',
};

export default function Dashboard({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <ClientDashboard lng={lng} />;
}
