import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import DashboardOverview from './components/pages/DashboardOverview';
import ApplicationAnalytics from './components/pages/ApplicationAnalytics';
import RejectionInsights from './components/pages/RejectionInsights';
import AIModelPerformance from './components/pages/AIModelPerformance';
import OperatorActivity from './components/pages/OperatorActivity';
import CitizenNotifications from './components/pages/CitizenNotifications';
import ServiceCategories from './components/pages/ServiceCategories';
import SystemLogs from './components/pages/SystemLogs';
import Settings from './components/pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: 'analytics', Component: ApplicationAnalytics },
      { path: 'rejections', Component: RejectionInsights },
      { path: 'ai-performance', Component: AIModelPerformance },
      { path: 'operators', Component: OperatorActivity },
      { path: 'notifications', Component: CitizenNotifications },
      { path: 'services', Component: ServiceCategories },
      { path: 'logs', Component: SystemLogs },
      { path: 'settings', Component: Settings },
    ],
  },
]);
