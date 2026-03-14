import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertTriangle, Home } from 'lucide-react';

export function RouterErrorBoundary() {
  const error = useRouteError();

  let title = 'कुछ गलत हो गया | Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';
  let status: number | null = null;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = 'पृष्ठ नहीं मिला | Page Not Found';
      message = `The page at "${window.location.pathname}" could not be found.`;
    } else {
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        background: 'linear-gradient(135deg, #F0F4FF 0%, #EFF6F1 100%)',
        fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      <div className="text-center max-w-lg">
        {/* Government stripe */}
        <div className="flex h-2 rounded-full overflow-hidden mb-8 w-48 mx-auto">
          <div className="flex-1" style={{ background: '#FF9933' }} />
          <div className="flex-1" style={{ background: '#FFFFFF', border: '1px solid #ddd' }} />
          <div className="flex-1" style={{ background: '#138808' }} />
        </div>

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#FFF0E0' }}
        >
          <AlertTriangle size={36} style={{ color: '#E8701A' }} />
        </div>

        {status && (
          <p
            className="mb-1"
            style={{ fontSize: '48px', fontWeight: 700, color: '#1C2B4A', fontFamily: "'Baloo 2', sans-serif", lineHeight: 1 }}
          >
            {status}
          </p>
        )}

        <h2
          className="mb-3"
          style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '22px', fontWeight: 700, color: '#1C2B4A' }}
        >
          {title}
        </h2>

        <p className="mb-6" style={{ fontSize: '14px', color: '#7A8BA3', lineHeight: '1.6' }}>
          {message}
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ background: '#003380', fontSize: '14px', fontWeight: 600 }}
          >
            <Home size={16} />
            होम पेज | Home
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{
              background: '#EEF1F7',
              color: '#1C2B4A',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            डैशबोर्ड | Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs" style={{ color: '#AAB4C8' }}>
          NIC · e-District Chhattisgarh · CSC Sahayak Portal
        </p>
      </div>
    </div>
  );
}
