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
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          lng={lng}
        />

        <div className="relative flex flex-1 flex-col overflow-y-auto">
          <div className="flex-none">
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              user={user}
              setUser={setUser}
              lng={lng}
            />
          </div>

          <main className="flex-1 h-full overflow-y-auto">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <div>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
