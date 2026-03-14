import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, IdCard, LogIn } from 'lucide-react';

const OPERATOR_STORAGE_KEY = 'csc_operator';

export interface OperatorInfo {
  username: string;
  operatorId: string;
}

export default function OperatorLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const id = operatorId.trim();
    if (!u || !id) {
      setError('कृपया ऑपरेटर यूज़रनेम और ऑपरेटर ID भरें। / Please enter Operator Username and Operator ID.');
      return;
    }
    setError('');
    const info: OperatorInfo = { username: u, operatorId: id };
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [OPERATOR_STORAGE_KEY]: info });
    }
    navigate('/welcome');
  };

  return (
    <div className="h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg p-6 border border-border-custom shadow-sm">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center mb-3">
              <User className="w-7 h-7 text-navy" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-semibold text-navy mb-1">ऑपरेटर लॉगिन / Operator Login</h2>
            <p className="text-sm text-muted-text">CSC सहायक का उपयोग करने के लिए प्रवेश करें</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">
                ऑपरेटर यूज़रनेम / Operator Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" strokeWidth={2} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-navy mb-1.5">
                ऑपरेटर ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" strokeWidth={2} />
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="Enter operator ID"
                  className="w-full h-10 pl-10 pr-3 rounded-md border border-border-custom bg-white text-sm text-navy placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-md bg-saffron hover:bg-saffron-hover text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" strokeWidth={2} />
              <span>प्रवेश करें / Continue</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="text-[10px] text-muted-text">
              v1.0.0 • CHIPS Chhattisgarh • Government of India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
