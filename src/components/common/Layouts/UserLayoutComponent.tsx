'use client';

import React, { useState } from 'react';

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
        <div className="relative flex flex-1 flex-col overflow-y-auto">
          {/* <!-- ===== Header Start ===== --> */}
          <div className="flex-none overflow-hidden">
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              user={user}
              setUser={setUser}
              lng={lng}
            />
          </div>
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="flex-1 h-full overflow-y-auto">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 overflow-y-auto">
              <div className="overflow-y-auto">{children}</div>
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
