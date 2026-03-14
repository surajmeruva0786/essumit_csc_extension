import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from './Header';
import ProgressStepper from './ProgressStepper';
import AIAssistantPopup from './AIAssistantPopup';

export default function Layout() {
  const location = useLocation();
  const isWelcome = location.pathname === '/';
  const isAIAssistant = location.pathname === '/ai-assistant';
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col bg-bg-primary">
      <Header onOpenAI={() => setIsAIPopupOpen(true)} />
      {!isWelcome && !isAIAssistant && <ProgressStepper />}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <AIAssistantPopup isOpen={isAIPopupOpen} onClose={() => setIsAIPopupOpen(false)} />
    </div>
  );
}