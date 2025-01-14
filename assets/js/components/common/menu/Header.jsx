import React from 'react';
import { Layout } from 'antd';
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';

const { Header } = Layout;

const AppHeader = ({ user, setUser, i18n }) => {

  return (
    <Header className="site-layout-background bg-white h-24" style={{ padding: 0 }}>
      <div className="flex justify-between lg:justify-end items-center h-full mr-4 ml-4">
        <div className="flex items-center gap-12 w-full justify-between lg:justify-end">
          <DropdownNotification i18n={i18n} />
          <DropdownUser i18n={i18n} user={user} setUser={setUser} />
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;