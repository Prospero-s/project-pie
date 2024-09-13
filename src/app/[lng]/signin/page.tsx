import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientSignIn = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title: 'Next.js SignUp Page | TailAdmin - Next.js Dashboard Template',
  description: 'This is Next.js Signup Page TailAdmin Dashboard Template',
};

const SignIn = ({ params: { lng } }: { params: { lng: string } }) => {
  return <ClientSignIn lng={lng} />;
};

export default SignIn;
