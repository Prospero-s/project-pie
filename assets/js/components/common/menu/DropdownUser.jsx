import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Dropdown, Menu } from 'antd';
import { 
  LogoutOutlined, 
  SettingOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { signOut } from '@/services/auth/awsAuthService';

const DropdownUser = ({ i18n, user }) => {
  const { t } = useTranslation('menu', { i18n });
  const lng = i18n.language;

  const handleLogout = async () => {
    await signOut(t, lng);
  };

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined className="!text-base" />,
      label: <a href={`/${lng}/profile`} className="text-base">{t('profile')}</a>
    },
    {
      key: 'settings',
      icon: <SettingOutlined className="!text-base" />,
      label: <a href={`/${lng}/settings`} className="text-base">{t('settings')}</a>
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="!text-base" />,
      label: <div className="text-base">{t('logout')}</div>,
      onClick: handleLogout
    }
  ];

  return (
    <Dropdown 
      menu={{ items }} 
      trigger={['click']} 
      placement="bottomRight"
    >
      <div className="flex items-center gap-4 cursor-pointer text-lg">
        <div className="hidden lg:block text-right">
          <span className="block font-medium">
            {user?.user_metadata?.full_name}
          </span>
          <span className="block text-sm lg:text-base">
            {user?.email}
          </span>
        </div>
        <Avatar
          size="large"
          icon={!user?.user_metadata?.avatar_url && <UserOutlined />}
          src={user?.user_metadata?.avatar_url}
          className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14"
        />
      </div>
    </Dropdown>
  );
};

export default DropdownUser;