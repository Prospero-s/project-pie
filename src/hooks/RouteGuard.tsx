'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import Loader from '@/components/common/Loader'; // Assurez-vous que le chemin est correct
import { useAuth } from '@/hooks/useAuth';

import { useLoading } from './LoadingContext';

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { loading, setLoading } = useLoading();
  const isFirstRender = useRef(true);

  const publicPaths = useMemo(
    () => [
      '/auth/signin',
      '/auth/signup',
      '/auth/forgot-password',
      '/auth/reset-password',
    ],
    [],
  );

  useEffect(() => {
    setLoading(true);
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (!user && !publicPaths.includes(pathname)) {
        router.push('/auth/signin');
      } else if (user && publicPaths.includes(pathname)) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user, router, setLoading, publicPaths, pathname]);

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default RouteGuard;
