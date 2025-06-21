import React from 'react';
import { Card, Space } from 'antd';
import { DatabaseOutlined, FormOutlined } from '@ant-design/icons';

const SelectCreationType = ({ onSelect, onNext, t }) => {
  const handleSelect = type => {
    onSelect(type);
    onNext();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Space
        direction="horizontal"
        size="large"
        className="w-full justify-center flex flex-wrap gap-4"
        style={{ marginBottom: '20px' }}
      >
        <Card
          hoverable
          className="w-64 text-center cursor-pointer flex-shrink-0 mb-4"
          onClick={() => handleSelect('automatic')}
        >
          <DatabaseOutlined className="text-4xl text-blue-500 mb-4" />
          <h3 className="text-lg font-medium">
            {t('creation.automatic_creation')}
          </h3>
          <p className="font-degarism">{t('creation.automatic_description')}</p>
        </Card>

        <span>OU</span>

        <Card
          hoverable
          className="w-64 text-center cursor-pointer flex-shrink-0 mb-4"
          onClick={() => handleSelect('manual')}
        >
          <FormOutlined className="text-4xl text-green-500 mb-4" />
          <h3 className="text-lg font-medium">
            {t('creation.manual_creation')}
          </h3>
          <p className="font-degarism">{t('creation.manual_description')}</p>
        </Card>
      </Space>
    </div>
  );
};

export default SelectCreationType;
