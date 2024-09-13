import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientProfile = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Profile',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

const Profile = ({ params: { lng } }: { params: { lng: string } }) => {
  return <ClientProfile lng={lng} />;
};

export default Profile;
