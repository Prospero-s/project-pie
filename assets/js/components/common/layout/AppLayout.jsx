import React, { useState, useEffect } from 'react';
import { Layout, Spin } from 'antd';

import Sidebar from '@/components/common/menu/Sidebar';
import AppHeader from '@/components/common/menu/Header';
import { useUser } from '@/context/userContext';
import { useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import logoProspero from '@img/logo/logo-icon-prospero-blue.svg';
import FooterLayout from '@/components/common/layout/Footer';

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

  // Afficher uniquement l'écran de chargement initial, pas à chaque redirection
  if (initialLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-8 fixed top-0 left-0 bg-white z-50">
        <img
          src={logoProspero}
          alt="Prospero"
          className="w-24 h-24 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 180, color: '#000000' }} spin />
          }
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        i18n={i18n}
      />
      <Layout className="site-layout">
        <AppHeader user={user} setUser={setUser} i18n={i18n} />
        <Content
          style={{
            margin: '16px 16px',
            overflow: 'auto',
            height: 'calc(100vh - 64px - 69px)',
          }}
        >
          <div className="rounded-md h-full" style={{ padding: 24 }}>
            {children}
          </div>
        </Content>
        <FooterLayout i18n={i18n} isDashboard={true} />
      </Layout>
    </Layout>
  );
}
