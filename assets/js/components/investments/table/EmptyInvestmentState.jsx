import React from 'react';
import { Button } from 'antd';
import { InboxOutlined, FileOutlined } from '@ant-design/icons';

const EmptyInvestmentState = ({ t, onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gray-50 rounded-full p-4 mb-4">
        <InboxOutlined className="text-4xl text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('no_investments.title')}
      </h3>
      <p className="font-degarism text-gray-600 mb-4">
        {t('no_investments.description')}
      </p>
      <Button type="primary" onClick={onAddClick}>
        <FileOutlined />
        {t('common.add')}
      </Button>
    </div>
  );
};

export default EmptyInvestmentState;
