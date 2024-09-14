'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

export default function AuthLayoutComponent({
  children,
}: {
  children: React.ReactNode;
  lng: string;
}) {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Erreur lors de la récupération de l'utilisateur:", error);
        setLoading(false);
        return;
      }
      if (data?.user) {
        router.push(`/user/dashboard`);
      } else {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isMounted, router]);

  if (loading) {
    return <></>;
  }

  return <>{children}</>;
}
