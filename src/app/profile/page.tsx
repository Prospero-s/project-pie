import dynamic from 'next/dynamic';

import DefaultLayout from '@/components/common/Layouts/DefaultLayout';

const ClientProfile = dynamic(() => import('./client'), { ssr: false });

const Profile = () => {
  return (
    <DefaultLayout>
      <ClientProfile />
    </DefaultLayout>
  );
};

export default Profile;
