import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ClientForgotPassword = dynamic(() => import('./client'), { ssr: false });

export const metadata: Metadata = {
  title:
    'Next.js Forgot Password Page | TailAdmin - Next.js Dashboard Template',
  description: 'This is Next.js Signin Page TailAdmin Dashboard Template',
};

const ForgotPassword = () => {
  return <ClientForgotPassword />;
};

export default ForgotPassword;
