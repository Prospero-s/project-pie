import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
import TableInvestement from '@/components/Tables/TableInvestment';

const ClientTable = () => {
  return (
    <>
      <Breadcrumb pageName="Enteprises" />
      <div className="flex flex-col gap-10">
        <TableInvestement />
      </div>
    </>
  );
};

export default ClientTable;
