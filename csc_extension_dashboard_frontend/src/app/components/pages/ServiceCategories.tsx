import { useState } from 'react';
import { FileText, Heart, Home, Briefcase, GraduationCap, Users, Shield, Car, ChevronRight, Search, TrendingUp, TrendingDown } from 'lucide-react';

const services = [
  {
    id: 1, category: 'Civil Documents', icon: FileText, color: '#2563eb', bg: '#eff6ff',
    items: [
      { name: 'Birth Certificate', applications: 28500, approvalRate: '88%', trend: 'up', change: '+4.2%' },
      { name: 'Death Certificate', applications: 8900, approvalRate: '91%', trend: 'up', change: '+1.1%' },
      { name: 'Marriage Certificate', applications: 12300, approvalRate: '85%', trend: 'down', change: '-0.8%' },
      { name: 'Domicile Certificate', applications: 15600, approvalRate: '82%', trend: 'up', change: '+2.4%' },
    ]
  },
  {
    id: 2, category: 'Caste & Income', icon: Shield, color: '#7c3aed', bg: '#faf5ff',
    items: [
      { name: 'Caste Certificate', applications: 24300, approvalRate: '81%', trend: 'up', change: '+3.1%' },
      { name: 'Income Certificate', applications: 9800, approvalRate: '79%', trend: 'down', change: '-1.4%' },
      { name: 'OBC Certificate', applications: 14200, approvalRate: '83%', trend: 'up', change: '+2.7%' },
      { name: 'SC/ST Certificate', applications: 18700, approvalRate: '86%', trend: 'up', change: '+1.9%' },
    ]
  },
  {
    id: 3, category: 'Social Welfare', icon: Heart, color: '#dc2626', bg: '#fef2f2',
    items: [
      { name: 'Old Age Pension', applications: 12400, approvalRate: '72%', trend: 'down', change: '-2.1%' },
      { name: 'Widow Pension', applications: 15600, approvalRate: '76%', trend: 'up', change: '+0.9%' },
      { name: 'Disability Pension', applications: 6800, approvalRate: '80%', trend: 'up', change: '+1.5%' },
      { name: 'MGNREGA Registration', applications: 21000, approvalRate: '89%', trend: 'up', change: '+3.8%' },
    ]
  },
  {
    id: 4, category: 'Land & Property', icon: Home, color: '#d97706', bg: '#fffbeb',
    items: [
      { name: 'Residence Certificate', applications: 19800, approvalRate: '85%', trend: 'up', change: '+2.3%' },
      { name: 'Land Mutation', applications: 7400, approvalRate: '77%', trend: 'down', change: '-1.1%' },
      { name: 'Khasra/Khatauni Copy', applications: 11200, approvalRate: '92%', trend: 'up', change: '+0.7%' },
    ]
  },
  {
    id: 5, category: 'Education', icon: GraduationCap, color: '#0891b2', bg: '#ecfeff',
    items: [
      { name: 'Scholarship Application', applications: 13400, approvalRate: '74%', trend: 'up', change: '+5.2%' },
      { name: 'Bonafide Certificate', applications: 5600, approvalRate: '94%', trend: 'up', change: '+0.4%' },
      { name: 'Fee Reimbursement', applications: 8900, approvalRate: '71%', trend: 'down', change: '-2.8%' },
    ]
  },
  {
    id: 6, category: 'Employment', icon: Briefcase, color: '#059669', bg: '#ecfdf5',
    items: [
      { name: 'Employment Certificate', applications: 4200, approvalRate: '88%', trend: 'up', change: '+1.6%' },
      { name: 'Skill Certificate', applications: 6700, approvalRate: '91%', trend: 'up', change: '+2.1%' },
      { name: 'MSME Registration', applications: 3100, approvalRate: '85%', trend: 'down', change: '-0.5%' },
    ]
  },
];

export default function ServiceCategories() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number[]>([1, 2, 3]);

  const toggleExpanded = (id: number) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalApplications = services.reduce((s, c) => s + c.items.reduce((t, i) => t + i.applications, 0), 0);
  const totalServices = services.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-gray-800">Service Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Government service portfolio managed through CSC Co-Pilot</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold mb-0.5" style={{ color: '#1e3a5f' }}>{services.length}</div>
          <div className="text-xs text-gray-500">Service Categories</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold mb-0.5" style={{ color: '#1e3a5f' }}>{totalServices}</div>
          <div className="text-xs text-gray-500">Total Services</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl font-bold mb-0.5" style={{ color: '#1e3a5f' }}>{(totalApplications / 1000).toFixed(0)}k</div>
          <div className="text-xs text-gray-500">Total Applications</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {services.map(cat => {
          const isExpanded = expanded.includes(cat.id);
          const filteredItems = cat.items.filter(item =>
            search === '' || item.name.toLowerCase().includes(search.toLowerCase())
          );
          if (search && filteredItems.length === 0) return null;
          const displayItems = search ? filteredItems : (isExpanded ? cat.items : cat.items.slice(0, 0));
          const catTotal = cat.items.reduce((s, i) => s + i.applications, 0);

          return (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleExpanded(cat.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: cat.bg }}>
                  <cat.icon size={20} style={{ color: cat.color }}/>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{cat.category}</div>
                  <div className="text-xs text-gray-500">{cat.items.length} services • {(catTotal / 1000).toFixed(1)}k applications</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-2">
                    {cat.items.slice(0, 2).map(item => (
                      <span key={item.name} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.name}</span>
                    ))}
                    {cat.items.length > 2 && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">+{cat.items.length - 2}</span>
                    )}
                  </div>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${(isExpanded || search) ? 'rotate-90' : ''}`}/>
                </div>
              </button>

              {(isExpanded || search) && (displayItems.length > 0) && (
                <div className="border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4">
                    {displayItems.map(item => (
                      <div key={item.name} className="rounded-xl border border-gray-100 p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800 leading-tight">{item.name}</span>
                          <span className={`flex items-center gap-0.5 text-xs font-medium ${item.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                            {item.trend === 'up' ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
                            {item.change}
                          </span>
                        </div>
                        <div className="text-lg font-bold mb-1" style={{ color: cat.color }}>
                          {(item.applications / 1000).toFixed(1)}k
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: item.approvalRate, backgroundColor: cat.color }}/>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{item.approvalRate}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">approval rate</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
