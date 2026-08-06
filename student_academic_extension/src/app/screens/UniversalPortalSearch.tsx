import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Search, Bell, BookOpen, Users, Filter, Clock } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  type: 'notice' | 'assignment' | 'circular' | 'faculty'
  description: string
  date: string
}

const mockResults: SearchResult[] = [
  { id: '1', title: 'Mid-term Examination Schedule', type: 'notice', description: 'Examinations start from Aug 1, 2026', date: '2026-07-20' },
  { id: '2', title: 'DBMS Assignment 3', type: 'assignment', description: 'Due on July 25, 2026', date: '2026-07-18' },
  { id: '3', title: 'Holiday Circular - Independence Day', type: 'circular', description: 'Office closed on Aug 15', date: '2026-07-15' },
  { id: '4', title: 'Dr. Smith - Computer Science', type: 'faculty', description: 'Professor, Data Structures', date: '2026-07-10' },
  { id: '5', title: 'Assignment Deadline Extended', type: 'notice', description: 'New deadline: July 28', date: '2026-07-22' },
  { id: '6', title: 'OS Mini Project Guidelines', type: 'assignment', description: 'Submit by July 30', date: '2026-07-21' },
]

const recentSearches = ['Mid-term schedule', 'DBMS assignment', 'Holiday']

export default function UniversalPortalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>(mockResults)
  const [filter, setFilter] = useState<string>('all')

  const handleSearch = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setResults(mockResults)
      return
    }
    const filtered = mockResults.filter((r) =>
      r.title.toLowerCase().includes(value.toLowerCase()) ||
      r.description.toLowerCase().includes(value.toLowerCase())
    )
    setResults(filtered)
  }

  const filteredResults = results.filter((r) => filter === 'all' || r.type === filter)

  const typeIcon = (type: string) => {
    switch (type) {
      case 'notice': return Bell
      case 'assignment': return BookOpen
      case 'circular': return Bell
      case 'faculty': return Users
      default: return Search
    }
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Universal Search</h1>
        <p className="text-muted-foreground text-sm">Search notices, assignments, circulars, and faculty</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search across portal..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
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
            <option value="notice">Notices</option>
            <option value="assignment">Assignments</option>
            <option value="circular">Circulars</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
      </div>

      {recentSearches.length > 0 && !query && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock size={16} />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(s)}
                  className="px-3 py-1 bg-muted rounded-full text-xs hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No results found
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((item) => {
            const Icon = typeIcon(item.type)
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="p-2 rounded-lg bg-muted text-primary">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
