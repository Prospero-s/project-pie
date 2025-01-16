import React, { useState, useEffect } from 'react';
import { Layout, Spin } from 'antd';

import Sidebar from '../menu/Sidebar';
import AppHeader from '../menu/Header';
import { useUser } from '@/context/userContext';
import { useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import logoProspero from '@img/logo/logo-prospero-black.svg';

const { Content } = Layout;

export default function AppLayout({ i18n, children }) {
  const { user, setUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {initialLoading && (
        <div className="h-screen w-screen flex flex-col items-center justify-center gap-8 fixed top-0 left-0 bg-white z-50">
        <img src={logoProspero} alt="Prospero" className="w-32 h-32 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <Spin indicator={<LoadingOutlined style={{ fontSize: 200, color: '#000000' }} spin />} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      )}
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
    </>
  );
}
