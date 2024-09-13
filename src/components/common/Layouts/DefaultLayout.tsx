'use client';

import { useEffect, useState } from 'react';

import Loader from '../Loader';

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
  lng: string;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, [setLoading]);

  return <>{loading ? <Loader /> : children}</>;
}
