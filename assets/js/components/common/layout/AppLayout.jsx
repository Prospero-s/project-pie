import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';

import Sidebar from '../menu/Sidebar';
import AppHeader from '../menu/Header';
import { useUser } from '@/context/userContext';
import { useParams } from 'react-router-dom';

const { Content } = Layout;

export default function AppLayout({ i18n, children }) {
  const { user, setUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} i18n={i18n} />
      <Layout className="site-layout">
        <AppHeader user={user} setUser={setUser} i18n={i18n} />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
