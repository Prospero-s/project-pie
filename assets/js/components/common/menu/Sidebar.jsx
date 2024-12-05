import React from 'react';
import { DashboardOutlined, FolderOutlined } from '@ant-design/icons';
import { Layout, Menu, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import logoProspero from '@img/logo/logo-prospero.svg';

const { Sider } = Layout;

const Sidebar = ({ sidebarOpen, setSidebarOpen, i18n }) => {
  const { t } = useTranslation('menu', { i18n });
  const { pathname } = useLocation();
  const lng = i18n.language;
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  const activePath = pathname.split('/').pop();


  React.useEffect(() => {
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
      key: 'investements',
      icon: <FolderOutlined className="!text-2xl lg:text-xl" />,
      label: <Link to={`/${lng}/investements`}>{t('portfolio')}</Link>,
    },
  ];

  return (
    <Sider collapsible={!isMobile} collapsed={isMobile || sidebarOpen} onCollapse={setSidebarOpen}>
      <div className="flex items-center justify-center p-4 h-24">
        <img src={logoProspero} alt="Logo" className="h-12 w-auto" />
        {!sidebarOpen && !isMobile && (
          <span className="ml-3 text-white text-xl font-semibold">Prospero</span>
        )}
      </div>
      <Divider className="my-0 bg-gray-600" />
      <Menu 
        theme="dark" 
        mode="inline" 
        selectedKeys={[activePath]} 
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;