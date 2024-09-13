import UserLayout from '@/components/common/Layouts/UserLayout';
import Entreprise from '@/components/Entreprise/Entreprise';

const ClientEntreprise = ({ lng }: { lng: string }) => {
  return (
    <UserLayout lng={lng}>
      <Entreprise lng={lng} />
    </UserLayout>
  );
};

export default ClientEntreprise;
