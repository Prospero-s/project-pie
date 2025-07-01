import React from 'react';
import { Layout } from 'antd';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import ToggleMode from './ToggleMode';
import logoProspero from '@img/logo/logo-prospero-blue.svg';

const { Header } = Layout;

const AppHeader = ({ user, setUser, i18n }) => {
  return (
    <Header className="site-layout-background bg-white h-16 p-6 shadow-sm">
      <div className="flex justify-between items-center h-full mr-4 ml-4">
        <div className="flex items-center gap-12">
          <img
            src={logoProspero}
            alt="Logo"
            className="h-6 w-auto transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-6">
          <DropdownNotification i18n={i18n} user={user} />
          <ToggleMode />
          <DropdownUser i18n={i18n} user={user} setUser={setUser} />
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;
