'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { useLoading } from './LoadingContext';

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading } = useLoading();
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
    if (isFirstRender.current) {
      console.log('isFirstRender', isFirstRender.current);
      console.log('user', user);
      console.log('pathname', pathname);
      isFirstRender.current = false;
      setLoading(true);

      if (!user && !publicPaths.includes(pathname)) {
        router.push('/auth/signin');
      } else if (user && publicPaths.includes(pathname)) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    }
  }, [user, router, setLoading, publicPaths, pathname]);

  useEffect(() => {
    setLoading(false);
  }, [pathname, setLoading]);

  return <>{children}</>;
};

export default RouteGuard;
