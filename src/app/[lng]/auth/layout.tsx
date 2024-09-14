import AuthLayoutComponent from '@/components/common/Layouts/AuthLayoutComponent';

export default function AuthLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return <AuthLayoutComponent lng={lng}>{children}</AuthLayoutComponent>;
}
