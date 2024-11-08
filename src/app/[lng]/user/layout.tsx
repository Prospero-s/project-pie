import { User } from '@supabase/supabase-js';

import UserLayoutComponent from '@/components/common/Layouts/UserLayoutComponent';

export default function UserLayout({
  children,
  params: { lng },
}: {
  children: React.ReactNode;
  params: { lng: string };
  user: User;
  setUser: (user: User) => void;
}) {
  return <UserLayoutComponent lng={lng}>{children}</UserLayoutComponent>;
}
