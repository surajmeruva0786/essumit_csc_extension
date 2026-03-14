import React from 'react';
import { Outlet } from 'react-router';
import { GovHeader } from '../components/GovHeader';
import { Sidebar } from '../components/Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF1F7' }}>
      <GovHeader isLoggedIn={true} operatorName="राजेश कुमार साहू" />
      <div className="flex flex-1" style={{ minHeight: 0 }}>
        <Sidebar />
        <main className="flex-1 overflow-auto" style={{ minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}