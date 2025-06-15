import React from 'react';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import TableDocuments from '@/components/documents/TableDocuments';
import { useTranslation } from 'react-i18next';

const Documents = ({ i18n }) => {
  const { t } = useTranslation('documents', { i18n });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={t('title')} />
      <TableDocuments t={t} lng={i18n.language} />
    </div>
  );
};

export default Documents;
