'use client';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { supabase } from '@/lib/supabaseClient';
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { User } from '@supabase/supabase-js';
import { Avatar, Dropdown, Menu, Skeleton } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const DropdownUser = (props: {
  lng: string;
  user: User | null;
  setUser: (user: User | null) => void;
}) => {
  const { t } = useTranslation('header');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      openNotificationWithIcon(
        'success',
        t('logoutSuccess'),
        t('logoutSuccessMessage'),
      );
      props.setUser(null);
      router.push(`/${props.lng}/auth/signin`);
    } catch (error) {
      console.error('Error signing out:', error);
      openNotificationWithIcon(
        'error',
        t('logoutError'),
        t('logoutErrorMessage'),
      );
    }
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<UserOutlined className="!text-lg" />}
        className="!p-2"
      >
        <Link href={`/${props.lng}/user/profile`} className="text-lg">
          {t('profile')}
        </Link>
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<SettingOutlined className="!text-lg" />}
        className="!p-2"
      >
        <Link href={`/${props.lng}/user/settings`} className="text-lg">
          {t('settings')}
        </Link>
      </Menu.Item>
      <Menu.Item
        key="3"
        icon={<LogoutOutlined className="!text-lg" />}
        onClick={handleLogout}
        className="!p-2"
      >
        <span className="text-lg">{t('logout')}</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
      <div className="flex items-center gap-4 cursor-pointer p-2 hover:bg-gray-100 rounded-md">
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {props.user ? (
              props.user.user_metadata.full_name
            ) : (
              <Skeleton.Input />
            )}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <Avatar
            size={50}
            icon={!props.user?.user_metadata?.picture && <UserOutlined />}
            src={props.user?.user_metadata?.picture || undefined}
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </div>
    </Dropdown>
  );
};

export default DropdownUser;
