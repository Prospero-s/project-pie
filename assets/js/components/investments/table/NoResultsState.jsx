import React from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const NoResultsState = ({ t, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="bg-gray-50 rounded-full p-4 mb-4">
        <InboxOutlined className="text-4xl text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('no_results.title')}
      </h3>
      <p className="text-gray-600 mb-4">{t('no_results.description')}</p>
      <Button onClick={onReset} type="primary">
        {t('common.reset_filters')}
      </Button>
    </div>
  );
};

export default NoResultsState;
