import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Search, FolderOpen, Bookmark, Trash2 } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  type: 'notice' | 'circular'
  date: string
  folder: string
}

const defaultBookmarks: Bookmark[] = [
  { id: '1', title: 'Mid-term Examination Schedule', type: 'notice', date: '2026-07-20', folder: 'Exams' },
  { id: '2', title: 'Independence Day Holiday Circular', type: 'circular', date: '2026-07-15', folder: 'Holidays' },
  { id: '3', title: 'Assignment Deadline Extended', type: 'notice', date: '2026-07-22', folder: 'Assignments' },
  { id: '4', title: 'Scholarship Application Circular', type: 'circular', date: '2026-07-18', folder: 'General' },
]

const folders = ['All', 'Exams', 'Assignments', 'Holidays', 'General']

export default function SmartBookmarking() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaultBookmarks)
  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('All')

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const filtered = bookmarks.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = folder === 'All' || b.folder === folder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Smart Bookmarks</h1>
        <p className="text-muted-foreground text-sm">Bookmark notices and circulars for quick access</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-muted-foreground" />
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No bookmarks found
            </CardContent>
          </Card>
        ) : (
          filtered.map((bookmark) => (
            <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 py-4">
                <div className="p-2 rounded-lg bg-muted text-yellow-500">
                  <Bookmark size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{bookmark.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="capitalize">{bookmark.type}</span>
                    <span>{bookmark.date}</span>
                    <span className="px-2 py-0.5 bg-muted rounded-full">{bookmark.folder}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleBookmark(bookmark.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
