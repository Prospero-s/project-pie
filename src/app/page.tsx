// src/pages/index.tsx
import { Metadata } from 'next';

import Loader from '@/components/common/Loader';

export const metadata: Metadata = {
  title: 'Project PIE Dashboard',
  description: 'This is Next.js with TailAdmin Dashboard Template',
};

export default function Home() {
  return <Loader />;
}
