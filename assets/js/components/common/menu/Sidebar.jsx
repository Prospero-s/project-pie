import React, { useState, useEffect } from 'react';
import {
  DashboardOutlined,
  FolderOutlined,
  FileSearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  ToolOutlined,
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
      icon: <AppstoreOutlined className="!text-2xl lg:text-xl" />,
      label: (
        <Link className="text-base" to={`/${lng}/dashboard`}>
          {t('dashboard')}
        </Link>
      ),
    },
    {
      key: 'investments',
      icon: <FolderOutlined className="!text-2xl lg:text-xl" />,
      label: (
        <Link className="text-base" to={`/${lng}/investments`}>
          {t('portfolio')}
        </Link>
      ),
    },
    {
      key: 'companies',
      icon: <FileSearchOutlined className="!text-2xl lg:text-xl" />,
      label: (
        <Link className="text-base" to={`/${lng}/companies`}>
          {t('companies')}
        </Link>
      ),
    },
    {
      key: 'documents',
      icon: <FolderOpenOutlined className="!text-2xl lg:text-xl" />,
      label: (
        <Link className="text-base" to={`/${lng}/documents`}>
          {t('documents')}
        </Link>
      ),
    },
    {
      key: 'divider',
      icon: <Divider className="my-0" />,
    },
    {
      key: 'Support',
      icon: <ToolOutlined className="!text-2xl lg:text-xl" />,
      label: (
        <Link className="text-base" to={`/${lng}/support`}>
          Assistance
        </Link>
      ),
    },
  ];

  return (
    <Sider
      className="!bg-gray_100 flex flex-col h-full"
      width={240}
      collapsible={!isMobile}
      collapsed={isMobile || !sidebarOpen}
      onCollapse={collapsed => setSidebarOpen(!collapsed)}
      trigger={null}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <button
          className="text-lg p-2 m-auto bg-gray_200 text-black rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <Divider className="my-0" />

      <div className="flex-1 overflow-auto">
        <Menu
          theme="light"
          className="bg-gray_100 p-2"
          mode="inline"
          selectedKeys={[activePath]}
          items={menuItems}
        />
      </div>

      <div className="absolute bottom-5 left-[15%] right-[15%] flex justify-center">
        <img
          src={sidebarOpen ? logoProspero : logoIconProspero}
          alt="Logo"
          className="h-6 w-auto mb-4 transition-all duration-300"
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
