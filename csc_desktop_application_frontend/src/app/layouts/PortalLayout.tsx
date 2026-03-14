import React from 'react';
import { Outlet } from 'react-router';
import { GovHeader } from '../components/GovHeader';
import { GovFooter } from '../components/GovFooter';

export function PortalLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF1F7' }}>
      <GovHeader isLoggedIn={false} />
      <main className="flex-1">
        <Outlet />
      </main>
      <GovFooter />
    </div>
  );
}
