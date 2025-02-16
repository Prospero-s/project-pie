import React, { useState } from 'react';
import { Modal, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { TeamOutlined, SettingOutlined } from '@ant-design/icons';
import GroupSettings from './sections/GroupSettings';

const SettingsModal = ({ visible, onClose, user, i18n }) => {
  const { t } = useTranslation('settings', { i18n });
  const [currentSection, setCurrentSection] = useState('group');

  const menuItems = [
    {
      key: 'group',
      icon: <TeamOutlined />,
      label: t('menu.group'),
    },
    {
      key: 'preferences',
      icon: <SettingOutlined />,
      label: t('menu.preferences'),
    },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'group':
        return <GroupSettings user={user} i18n={i18n} />;
      case 'preferences':
        return <div>{t('sections.preferences.coming_soon')}</div>;
      default:
        return null;
    }
  };

  return (
    <Modal
      title={t('title')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="settings-modal"
    >
      <div className="flex h-[600px]">
        <Menu
          className="w-64 h-full border-r"
          selectedKeys={[currentSection]}
          items={menuItems}
          onClick={({ key }) => setCurrentSection(key)}
        />
        <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
