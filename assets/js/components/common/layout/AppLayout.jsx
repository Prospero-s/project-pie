import React, { useState, useEffect } from 'react';
import { Layout, Spin } from 'antd';

import Sidebar from '@/components/common/menu/Sidebar';
import AppHeader from '@/components/common/menu/Header';
import { useUser } from '@/context/userContext';
import { useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
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
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-8 fixed top-0 left-0 bg-white dark:bg-gray-900 z-50">
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          {/* Spinner de chargement autour du logo */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined
                  style={{
                    fontSize: '120px',
                    color: '#3B71D6',
                    opacity: 0.3,
                  }}
                  spin
                />
              }
            />
          </div>

          {/* Icône Prospero au centre */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="144"
              height="162"
              viewBox="0 0 144 162"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '60px', height: 'auto' }}
            >
              <path
                d="M31.0216 121.341L3.04466 104.445C1.3211 103.406 0.268555 101.54 0.268555 99.5272L0.268555 24.7612C0.268555 21.8978 3.39396 20.1329 5.84832 21.6129L36.5967 40.186L36.5967 118.192C36.5967 121.056 33.4713 122.821 31.017 121.341H31.0216Z"
                fill="#3B71D6"
              />
              <path
                d="M113.247 40.6685L141.224 57.5641C142.948 58.6028 144 60.4689 144 62.482V137.248C144 140.111 140.875 141.876 138.42 140.396L107.672 121.823L107.672 43.8169C107.672 40.9535 110.797 39.1886 113.252 40.6685H113.247Z"
                fill="#3B71D6"
              />
              <path
                d="M90.2297 108.591L90.2297 32.0645C90.2297 30.0008 89.1221 28.0934 87.325 27.0731L42.0986 1.32531C39.6488 -0.0719258 36.6016 1.70219 36.6016 4.51964L36.6016 40.1446L51.1393 48.4223C52.9318 49.4427 54.0441 51.3501 54.0441 53.4137L54.0441 129.935C54.0441 131.999 55.1517 133.907 56.9488 134.927L102.175 160.675C104.625 162.072 107.672 160.298 107.672 157.48L107.672 121.855L93.1345 113.578C91.342 112.557 90.2297 110.65 90.2297 108.586V108.591Z"
                fill="#3B71D6"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen h-screen overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        i18n={i18n}
        user={user}
      />
      <Layout className="site-layout bg-white dark:bg-gray-900">
        <AppHeader user={user} setUser={setUser} i18n={i18n} />
        <Content
          className="p-4 mb-6 overflow-auto"
          style={{ height: 'calc(100vh - 64px - 69px)' }}
        >
          <div className="rounded-md h-full p-6">{children}</div>
        </Content>
        <FooterLayout i18n={i18n} isDashboard={true} />
      </Layout>
    </Layout>
  );
}
