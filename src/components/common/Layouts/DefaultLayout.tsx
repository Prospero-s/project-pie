'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useUser } from '@/context/userContext';
import { supabase } from '@/lib/supabaseClient';

export default function DefaultLayout({
  children,
  lng,
}: {
  children: React.ReactNode;
  lng: string;
}) {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setLoading(false);
        router.push(`/${lng}/auth/signin`);
      }
      if (data?.user) {
        if (!user) {
          setUser(data.user);
        }
        router.push(`/${lng}/user/dashboard`);
        setLoading(false);
      } else {
        router.push(`/${lng}/auth/signin`);
        setLoading(false);
      }
    };
    fetchUser();
  }, [user, setUser]);

  useEffect(() => {
    const handleRouteChange = (event: PopStateEvent) => {
      if (event.state && !user) {
        setLoading(true);
        router.push(`/${lng}/auth/signin`);
      }
      setLoading(false);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user, router, lng]);

  if (loading) {
    return <></>;
  }
  return <>{children}</>;
}
