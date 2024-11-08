'use client';

import { Spin } from 'antd';
import React, { Suspense, useState } from 'react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/context/userContext';

export default function UserLayoutComponent({
  children,
  lng,
}: {
  children: React.ReactNode;
  lng: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser } = useUser();

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          lng={lng}
        />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
            setUser={setUser}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <Suspense fallback={<Spin size="large" />}>{children}</Suspense>
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
