import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientEntreprise = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Entreprises',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

export default function Entreprises({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <ClientEntreprise lng={lng} />;
}
