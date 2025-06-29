import React, { useState, useEffect } from 'react';
import {
  FolderOutlined,
  FileSearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Divider, notification } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import logoProspero from '@img/logo/logo-prospero-blue.svg';
import logoIconProspero from '@img/logo/logo-icon-prospero-blue.svg';
import axios from 'axios';

const { Sider } = Layout;

const Sidebar = ({ sidebarOpen, setSidebarOpen, i18n, user }) => {
  const { t } = useTranslation('menu', { i18n });
  const { pathname } = useLocation();
  const lng = i18n.language;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const activePath = pathname.split('/').pop();

  useEffect(() => {
    fetchGroupData();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGroupData = async () => {
    try {
      const response = await axios.get('/api/user-groups', {
        headers: {
          'x-cognito-id': user?.id,
          'x-cognito-email': user?.email,
          'x-cognito-name': user?.user_metadata?.full_name,
        },
      });

      if (response.data.groups && response.data.groups.length > 0) {
        setGroup(response.data.groups[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group data:', error);
      notification.error({
        message: t('sections.group.error_loading'),
        description: error.message,
      });
      setLoading(false);
    }
  };

  const mainMenuItems = [
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
  ];

  const supportMenuItems = [
    {
      key: 'support',
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
      className="bg-gray_100 flex flex-col h-full"
      width={240}
      collapsible={!isMobile}
      collapsed={isMobile || !sidebarOpen}
      onCollapse={collapsed => setSidebarOpen(!collapsed)}
      trigger={null}
    >
      <div className="flex items-center h-16 px-4">
        {/* Affichage du nom du groupe avec loading - masqué si sidebar fermé */}
        {sidebarOpen && (
          <div className="flex items-center flex-1 min-w-0">
            {loading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
            ) : group ? (
              <h2 className="text-xl font-semibold truncate">{group.name}</h2>
            ) : (
              <h2 className="text-xl font-semibold text-gray-400 truncate">
                Aucun groupe
              </h2>
            )}
          </div>
        )}

        <button
          className={`text-lg p-2 bg-gray_200 text-black rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300 flex-shrink-0 ${
            sidebarOpen ? 'ml-2' : 'm-auto'
          }`}
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
          items={mainMenuItems}
        />
        <Divider className="my-2" />
        <Menu
          theme="light"
          className="bg-gray_100 p-2"
          mode="inline"
          selectedKeys={[activePath]}
          items={supportMenuItems}
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
