import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientSettings = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Settings',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

const Settings = ({ params: { lng } }: { params: { lng: string } }) => {
  return <ClientSettings lng={lng} />;
};

export default Settings;
