import React, { useState, useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Spin, Divider, Switch, Select, Space, Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

const Notifications = ({ user, i18n }) => {
  const { t } = useTranslation('settings', { i18n });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetchGroupData();
  }, []);

  const handleChange = value => {
    // console.log(`selected ${value}`);
  };

  if (!loading) {
    return <Spin />;
  }

  return (
    <div className="space-y-6">
      <Divider orientation="left">{t('notification.label')}</Divider>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span>{t('notification.email_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
        </div>
        <div className="flex justify-between items-center">
          <span>{t('notification.sms_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
        </div>
        <div className="flex justify-between items-center">
          <span>{t('notification.push_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
        </div>
      </div>
      <Divider orientation="left">{t('preferences.label')}</Divider>
      <div className="flex justify-between items-center">
        <p>{t('preferences.languages.label')}</p>
        <Space wrap>
          <Select
            className="w-48"
            placeholder={t('preferences.languages.placeholder')}
            onChange={handleChange}
            options={[
              {
                value: 'fr',
                label: t('preferences.languages.french'),
              },
              {
                value: 'en',
                label: t('preferences.languages.english'),
              },
              {
                value: 'de',
                label: t('preferences.languages.germany'),
              },
            ]}
          />
        </Space>
      </div>
      <div className="flex justify-between items-center">
        <p>{t('preferences.delete_account')}</p>
        <Flex wrap gap="small">
          <Button danger className="w-48">
            {t('preferences.btn_delete_account')}
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default Notifications;
