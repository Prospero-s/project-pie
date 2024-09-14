import UserLayoutComponent from '@/components/common/Layouts/UserLayoutComponent';

export default function UserLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return <UserLayoutComponent lng={lng}>{children}</UserLayoutComponent>;
}
