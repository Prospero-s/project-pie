import { Metadata } from 'next';
import dynamic from 'next/dynamic';
const ClientTableInvestement = dynamic(() => import('./client'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Project PIE Dashboard',
  description: 'This is Next.js with TailAdmin Dashboard Template',
};

const TableInvestementPage = ({
  params: { lng },
}: {
  params: { lng: string };
}) => {
  return <ClientTableInvestement lng={lng} />;
};

export default TableInvestementPage;
