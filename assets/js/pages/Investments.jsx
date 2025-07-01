import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import TableInvestments from '@/components/investments/TableInvestments';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from 'antd';
import { DownloadOutlined, FileOutlined } from '@ant-design/icons';

const Investments = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const lng = useParams().lng;
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(
    searchParams.get('modal') === 'add',
  );

  const [isTableEmpty, setIsTableEmpty] = useState(false); // nouvel état pour suivre la table

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Breadcrumb pageName={t('my_portfolio')} />

        {!isTableEmpty && (
          <div className="flex gap-2 ml-auto">
            <Button
              icon={<FileOutlined />}
              type="primary"
              onClick={() => setIsModalOpen(true)}
            >
              {t('common.add')}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              type="default"
              onClick={() => null}
            >
              {t('common.exportXSLX')}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <TableInvestments
          i18n={i18n}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onEmptyStateChange={setIsTableEmpty} // 👈 Passe la fonction ici
        />
      </div>
    </div>
  );
};

export default Investments;
