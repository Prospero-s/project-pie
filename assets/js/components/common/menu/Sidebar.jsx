import React, { useState, useEffect } from 'react';
import {
  DashboardOutlined,
  FolderOutlined,
  FileSearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import logoProspero from '@img/logo/logo-prospero-blue.svg';
import logoIconProspero from '@img/logo/logo-icon-prospero-blue.svg';

const { Sider } = Layout;

const Sidebar = ({ sidebarOpen, setSidebarOpen, i18n }) => {
  const { t } = useTranslation('menu', { i18n });
  const { pathname } = useLocation();
  const lng = i18n.language;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  // const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const activePath = pathname.split('/').pop();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined className="!text-2xl lg:text-xl" />,
      label: <Link to={`/${lng}/dashboard`}>{t('dashboard')}</Link>,
    },
    {
      key: 'investments',
      icon: <FolderOutlined className="!text-2xl lg:text-xl" />,
      label: <Link to={`/${lng}/investments`}>{t('portfolio')}</Link>,
    },
    {
      key: 'companies',
      icon: <FileSearchOutlined className="!text-2xl lg:text-xl" />,
      label: <Link to={`/${lng}/companies`}>{t('companies')}</Link>,
    },
    {
      key: 'documents',
      icon: <FolderOpenOutlined className="!text-2xl lg:text-xl" />,
      label: <Link to={`/${lng}/documents`}>{t('documents')}</Link>,
    },
  ];

  return (
    <Sider
      className="!bg-gray_100"
      width={240}
      collapsible={!isMobile}
      collapsed={isMobile || !sidebarOpen}
      onCollapse={collapsed => setSidebarOpen(!collapsed)}
      trigger={null}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <img
          src={sidebarOpen ? logoProspero : logoIconProspero}
          alt="Logo"
          className="h-6 w-auto transition-all duration-300"
        />
        <button
          className="p-2 ml-2 bg-gray_200 text-black rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      <Divider className="my-0" />
      <Menu
        theme="light"
        className="bg-gray_100 p-2"
        mode="inline"
        selectedKeys={[activePath]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
