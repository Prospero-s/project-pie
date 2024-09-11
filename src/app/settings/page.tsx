import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientSettings = dynamic(() => import('./client'), { ssr: false });

const Settings = () => {
  return (
    <DefaultLayout>
      <ClientSettings />
    </DefaultLayout>
  );
};

export default Settings;
