import { createBrowserRouter } from 'react-router';
import { PortalLayout } from './layouts/PortalLayout';
import { AppLayout } from './layouts/AppLayout';
import { PortalHome } from './pages/PortalHome';
import { LoginPage } from './pages/LoginPage';
import { ServicesPage } from './pages/ServicesPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewApplicationPage } from './pages/NewApplicationPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { AIExtractionPage } from './pages/AIExtractionPage';
import { DataReviewPage } from './pages/DataReviewPage';
import { ValidationPage } from './pages/ValidationPage';
import { SuccessPage } from './pages/SuccessPage';
import { HistoryPage } from './pages/HistoryPage';
import { HelpPage } from './pages/HelpPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CitizenRecordsPage } from './pages/CitizenRecordsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PortalLayout,
    ErrorBoundary: RouterErrorBoundary,
    children: [
      { index: true, Component: PortalHome },
      { path: 'login', Component: LoginPage },
      { path: 'services', Component: ServicesPage },
      { path: '*', Component: RouterErrorBoundary },
    ],
  },
  {
    path: '/app',
    Component: AppLayout,
    ErrorBoundary: RouterErrorBoundary,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'new', Component: NewApplicationPage },
      { path: 'upload', Component: DocumentUploadPage },
      { path: 'extraction', Component: AIExtractionPage },
      { path: 'review', Component: DataReviewPage },
      { path: 'validation', Component: ValidationPage },
      { path: 'success', Component: SuccessPage },
      { path: 'history', Component: HistoryPage },
      { path: 'analytics', Component: AnalyticsPage },
      { path: 'citizens', Component: CitizenRecordsPage },
      { path: 'settings', Component: PlaceholderPage },
      { path: 'help', Component: HelpPage },
      { path: '*', Component: RouterErrorBoundary },
    ],
  },
  {
    path: '*',
    ErrorBoundary: RouterErrorBoundary,
    Component: RouterErrorBoundary,
  },
]);