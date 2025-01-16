import React from 'react';
import { Card, Space } from 'antd';
import { DatabaseOutlined, FormOutlined } from '@ant-design/icons';

const SelectCreationType = ({ onSelect, onNext, t }) => {
  const handleSelect = (type) => {
    onSelect(type);
    onNext();
  };

  return (
    <Space direction="horizontal" size="large" className="w-full justify-center">
      <Card
        hoverable
        className="w-64 text-center cursor-pointer"
        onClick={() => handleSelect('automatic')}
      >
        <DatabaseOutlined className="text-4xl text-blue-500 mb-4" />
        <h3 className="text-lg font-medium">{t('creation.automatic_creation')}</h3>
        <p>{t('creation.automatic_description')}</p>
      </Card>

      <Card
        hoverable
        className="w-64 text-center cursor-pointer"
        onClick={() => handleSelect('manual')}
      >
        <FormOutlined className="text-4xl text-green-500 mb-4" />
        <h3 className="text-lg font-medium">{t('creation.manual_creation')}</h3>
        <p>{t('creation.manual_description')}</p>
      </Card>
    </Space>
  );
};

export default SelectCreationType; 