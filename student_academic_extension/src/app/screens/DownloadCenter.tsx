import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Download, Search, Star, Clock, FileText, Filter } from 'lucide-react'

interface DownloadItem {
  id: string
  name: string
  type: 'assignment' | 'notes' | 'paper' | 'notice'
  subject: string
  date: string
  size: string
  favorite: boolean
}

const defaultDownloads: DownloadItem[] = [
  { id: '1', name: 'Data Structures Lab Manual', type: 'notes', subject: 'DS', date: '2026-07-18', size: '2.4 MB', favorite: true },
  { id: '2', name: 'DBMS Assignment 3', type: 'assignment', subject: 'DBMS', date: '2026-07-20', size: '1.1 MB', favorite: false },
  { id: '3', name: 'OS Previous Year Paper', type: 'paper', subject: 'OS', date: '2026-07-15', size: '3.2 MB', favorite: true },
  { id: '4', name: 'Mid-term Schedule', type: 'notice', subject: 'General', date: '2026-07-20', size: '0.5 MB', favorite: false },
]

export default function DownloadCenter() {
  const [downloads, setDownloads] = useState<DownloadItem[]>(defaultDownloads)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const toggleFavorite = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
    )
  }

  const filtered = downloads.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.subject.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || d.type === filter
    return matchesSearch && matchesFilter
  })

  const typeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'text-blue-500'
      case 'notes': return 'text-green-500'
      case 'paper': return 'text-orange-500'
      case 'notice': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Download Center</h1>
        <p className="text-muted-foreground text-sm">Recently downloaded academic resources</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search downloads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="assignment">Assignments</option>
            <option value="notes">Notes</option>
            <option value="paper">Papers</option>
            <option value="notice">Notices</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No downloads found
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`p-2 rounded-lg bg-muted ${typeColor(item.type)}`}>
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    <span>{item.subject}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                    <span>{item.size}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`p-2 rounded-md transition-colors ${item.favorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                >
                  <Star size={18} fill={item.favorite ? 'currentColor' : 'none'} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  <Download size={16} />
                  Download
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
