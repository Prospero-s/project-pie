import React, { useState, useEffect } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import { Spin, Divider, Switch, Select, Space, Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  fetchNotificationSettings,
  changeNotificationSettings,
} from '@/services/notification/notificationService';

const Preferences = ({ user, i18n }) => {
  const { t } = useTranslation('settings', { i18n });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchNotificationSettings(user);
        setSettings(data.settings);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleToggle = setting => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting],
    }));

    changeNotificationSettings(user, { [setting]: !settings[setting] }).catch(
      error => console.error('Error changing notification settings:', error),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Divider orientation="left">{t('notification.label')}</Divider>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span>{t('notification.email_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            checked={settings.email_enabled}
            onChange={() => handleToggle('email_enabled')}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>{t('notification.sms_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            checked={settings.sms_enabled}
            onChange={() => handleToggle('sms_enabled')}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>{t('notification.push_enabled')}</span>
          <Switch
            checkedChildren={<CheckOutlined />}
            checked={settings.push_enabled}
            onChange={() => handleToggle('push_enabled')}
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

export default Preferences;
