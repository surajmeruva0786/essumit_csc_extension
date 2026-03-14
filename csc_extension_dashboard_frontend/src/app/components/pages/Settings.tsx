import { useState } from 'react';
import { Cpu, Database, Bell, Puzzle, RefreshCw, Key, ChevronRight, Save, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Switch from '@mui/material/Switch';

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <Switch
    checked={enabled}
    onChange={onToggle}
    inputProps={{ 'aria-label': 'setting toggle' }}
    sx={{
      '& .MuiSwitch-switchBase.Mui-checked': {
        color: '#1a4592',
        '&:hover': { backgroundColor: 'rgba(26,69,146,0.08)' },
      },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#1a4592',
      },
    }}
  />
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
    <div className="p-2 rounded-lg bg-blue-50">
      <Icon size={18} style={{ color: '#1e3a5f' }}/>
    </div>
    <div>
      <h3 className="text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const SettingRow = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
    <div className="ml-4 flex-shrink-0">{children}</div>
  </div>
);

export default function Settings() {
  const [aiSettings, setAiSettings] = useState({
    autoFlagRejections: true,
    confidenceThreshold: 0.82,
    batchProcessing: true,
    humanReviewBelow: 0.75,
    enableExplainability: true,
    retrainMonthly: false,
  });

  const [notifSettings, setNotifSettings] = useState({
    smsOnApproval: true,
    smsOnRejection: true,
    emailOperatorWarnings: true,
    pushNotifications: false,
    dailyDigest: true,
    criticalAlerts: true,
  });

  const [syncStatus] = useState({
    nicPortal: { status: 'connected', lastSync: '2 min ago', health: 'good' },
    aadhaarAPI: { status: 'connected', lastSync: '5 min ago', health: 'good' },
    districtDB: { status: 'connected', lastSync: '1 min ago', health: 'good' },
    smsGateway: { status: 'degraded', lastSync: '14 min ago', health: 'warn' },
    chromeExt: { status: 'connected', lastSync: 'live', health: 'good' },
  });

  const [apiKeys] = useState([
    { name: 'NIC Portal API Key', key: 'nic_prod_••••••••••••••••••••ab3f', lastUsed: '1 min ago', status: 'active' },
    { name: 'Aadhaar Verification API', key: 'aadh_••••••••••••••••••••9c2d', lastUsed: '5 min ago', status: 'active' },
    { name: 'MSG91 SMS Gateway', key: 'msg91_••••••••••••••••••••f7a1', lastUsed: '14 min ago', status: 'degraded' },
    { name: 'DigiLocker OAuth', key: 'digi_••••••••••••••••••••0e8b', lastUsed: '2 hr ago', status: 'active' },
  ]);

  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); toast.success('Settings saved successfully!'); };

  const toggle = (setter: any, key: string) => setter((prev: any) => ({ ...prev, [key]: !prev[key] }));

  const healthColor: Record<string, string> = { good: '#138808', warn: '#d97706', error: '#dc2626' };
  const healthBg: Record<string, string> = { good: '#f0fdf4', warn: '#fffbeb', error: '#fef2f2' };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform configuration and integration management</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white shadow-sm transition-all w-fit ${saved ? '' : 'hover:opacity-90'}`}
          style={{ backgroundColor: saved ? '#138808' : '#1e3a5f' }}
        >
          {saved ? <><CheckCircle size={15}/> Saved!</> : <><Save size={15}/> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* AI Model Configuration */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={Cpu} title="AI Model Configuration" subtitle="Control AI prediction behavior and thresholds"/>

          <SettingRow label="Auto-flag Predicted Rejections" sub="Automatically warn operators before submission">
            <Toggle enabled={aiSettings.autoFlagRejections} onToggle={() => toggle(setAiSettings, 'autoFlagRejections')}/>
          </SettingRow>
          <SettingRow label="Confidence Threshold" sub={`Flag applications below ${(aiSettings.confidenceThreshold * 100).toFixed(0)}% confidence`}>
            <div className="flex items-center gap-2">
              <input
                type="range" min={0.5} max={0.99} step={0.01}
                value={aiSettings.confidenceThreshold}
                onChange={e => setAiSettings(p => ({ ...p, confidenceThreshold: parseFloat(e.target.value) }))}
                className="w-24 accent-[#1e3a5f]"
              />
              <span className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{(aiSettings.confidenceThreshold * 100).toFixed(0)}%</span>
            </div>
          </SettingRow>
          <SettingRow label="Batch Processing" sub="Process multiple applications simultaneously">
            <Toggle enabled={aiSettings.batchProcessing} onToggle={() => toggle(setAiSettings, 'batchProcessing')}/>
          </SettingRow>
          <SettingRow label="Human Review Below" sub={`Force manual review under ${(aiSettings.humanReviewBelow * 100).toFixed(0)}% confidence`}>
            <div className="flex items-center gap-2">
              <input
                type="range" min={0.5} max={0.9} step={0.01}
                value={aiSettings.humanReviewBelow}
                onChange={e => setAiSettings(p => ({ ...p, humanReviewBelow: parseFloat(e.target.value) }))}
                className="w-24 accent-[#1e3a5f]"
              />
              <span className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{(aiSettings.humanReviewBelow * 100).toFixed(0)}%</span>
            </div>
          </SettingRow>
          <SettingRow label="AI Explainability" sub="Show reason codes with predictions">
            <Toggle enabled={aiSettings.enableExplainability} onToggle={() => toggle(setAiSettings, 'enableExplainability')}/>
          </SettingRow>
          <SettingRow label="Monthly Model Retraining" sub="Auto-retrain on last day of month">
            <Toggle enabled={aiSettings.retrainMonthly} onToggle={() => toggle(setAiSettings, 'retrainMonthly')}/>
          </SettingRow>

          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f8' }}>
            <div className="text-xs font-medium text-gray-600 mb-1">Current Model</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-700">CSC-CoP ilot-v2.3.1</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Accuracy: 91.8%</span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={Bell} title="Notification Settings" subtitle="Configure alerts and citizen communication"/>

          <SettingRow label="SMS on Approval" sub="Send SMS to citizen when application approved">
            <Toggle enabled={notifSettings.smsOnApproval} onToggle={() => toggle(setNotifSettings, 'smsOnApproval')}/>
          </SettingRow>
          <SettingRow label="SMS on Rejection" sub="Notify citizen with rejection reason">
            <Toggle enabled={notifSettings.smsOnRejection} onToggle={() => toggle(setNotifSettings, 'smsOnRejection')}/>
          </SettingRow>
          <SettingRow label="Email Operator Warnings" sub="Alert CSC operators via email for AI flags">
            <Toggle enabled={notifSettings.emailOperatorWarnings} onToggle={() => toggle(setNotifSettings, 'emailOperatorWarnings')}/>
          </SettingRow>
          <SettingRow label="Push Notifications" sub="Browser push for dashboard alerts">
            <Toggle enabled={notifSettings.pushNotifications} onToggle={() => toggle(setNotifSettings, 'pushNotifications')}/>
          </SettingRow>
          <SettingRow label="Daily Digest Email" sub="Send daily summary to district officers">
            <Toggle enabled={notifSettings.dailyDigest} onToggle={() => toggle(setNotifSettings, 'dailyDigest')}/>
          </SettingRow>
          <SettingRow label="Critical System Alerts" sub="Immediate alerts for errors and outages">
            <Toggle enabled={notifSettings.criticalAlerts} onToggle={() => toggle(setNotifSettings, 'criticalAlerts')}/>
          </SettingRow>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-gray-600">Notification Recipients</div>
            <input
              type="text"
              defaultValue="admin@csc.gov.in, tech@nic.in"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Data Sync Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={RefreshCw} title="Data Sync Status" subtitle="Integration health and last sync information"/>
          <div className="space-y-3">
            {Object.entries(syncStatus).map(([key, s]) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <div className="p-2 rounded-lg" style={{ backgroundColor: healthBg[s.health] }}>
                  {s.health === 'good'
                    ? <CheckCircle size={16} style={{ color: healthColor[s.health] }}/>
                    : <AlertCircle size={16} style={{ color: healthColor[s.health] }}/>
                  }
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-gray-400"/>
                    <span className="text-xs text-gray-400">Last sync: {s.lastSync}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  s.status === 'connected' ? 'bg-green-100 text-green-700' :
                  s.status === 'degraded' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {s.status}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw size={14}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Extension Integration */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={Puzzle} title="Extension Integration Status" subtitle="Chrome Extension deployment and configuration"/>
          <div className="space-y-3">
            {[
              { label: 'Extension Version', value: 'v3.2.1', badge: 'Latest', badgeColor: '#138808', badgeBg: '#f0fdf4' },
              { label: 'Active Installations', value: '2,891', badge: 'operators', badgeColor: '#2563eb', badgeBg: '#eff6ff' },
              { label: 'Pending Updates', value: '143', badge: 'operators', badgeColor: '#d97706', badgeBg: '#fffbeb' },
              { label: 'Blocked Versions', value: 'v2.x, v1.x', badge: 'deprecated', badgeColor: '#dc2626', badgeBg: '#fef2f2' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{item.value}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: item.badgeBg, color: item.badgeColor }}>
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg border border-gray-100">
            <div className="text-xs font-medium text-gray-600 mb-2">Extension Config Endpoint</div>
            <div className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded break-all">
              https://api.csc-copilot.gov.in/ext/config/v3
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 xl:col-span-2">
          <SectionHeader icon={Key} title="API Keys & Credentials" subtitle="Manage integration API keys and access tokens"/>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  {['Service', 'API Key', 'Last Used', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((ak, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{ak.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{ak.key}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{ak.lastUsed}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        ak.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ak.status.charAt(0).toUpperCase() + ak.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Rotate</button>
                        <button className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Key size={14}/> Generate New API Key
          </button>
        </div>
      </div>
    </div>
  );
}