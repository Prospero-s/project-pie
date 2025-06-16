import React, { useState } from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import UploadPopup from '@/components/common/upload/UploadPopup';

const EmptyDocumentState = ({ t, i18n, lng }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const handleButtonClick = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };



  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-slate-200">
      <FileTextOutlined className="text-4xl text-slate-300 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        {t('empty.title')}
      </h3>
      <p className="text-sm text-slate-500 mb-4 text-center max-w-md">
        {t('empty.description')}
      </p>
      <Button type="primary" onClick={handleButtonClick} className="bg-blue-500">
        {t('empty.action')}
      </Button>
      {isPopupVisible && (
        <UploadPopup
          visible={isPopupVisible}
          onClose={handleClosePopup}
          company={null}
          i18n={i18n}
          lng={lng}
        />
      )}
    </div>
  );
};

export default EmptyDocumentState;
