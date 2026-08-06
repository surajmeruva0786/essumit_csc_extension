import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import * as Icons from 'lucide-react'
import { Plus, X } from 'lucide-react'
import type { QuickAction } from '../context/QuickActionsContext'

const AVAILABLE_ICONS = [
  'CalendarCheck', 'BarChart3', 'Clock', 'Bell', 'BookOpen',
  'Settings', 'Home', 'Mail', 'FileText', 'GraduationCap',
  'User', 'Link', 'Globe', 'Briefcase', 'ClipboardList',
  'HelpCircle', 'Star', 'Zap', 'Layers', 'Target',
] as const

export default function ActionEditor({ onSave, onCancel, initial }: { onSave: (action: Omit<QuickAction, 'id'>) => void; onCancel: () => void; initial?: QuickAction }) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [shortcut, setShortcut] = useState(initial?.shortcut ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'CalendarCheck')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    onSave({ label: label.trim(), url: url.trim(), shortcut: shortcut.trim(), icon })
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">{initial ? 'Edit Action' : 'Add Custom Action'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Open Results"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. /comparison"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Shortcut</label>
            <input
              type="text"
              value={shortcut}
              onChange={e => setShortcut(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Alt+5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="grid grid-cols-10 gap-2">
              {AVAILABLE_ICONS.map(iconName => {
                const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ size?: number }> | undefined
                if (!IconComponent) return null
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded-md border flex items-center justify-center transition-colors ${
                      icon === iconName ? 'border-primary bg-primary/10' : 'border-input hover:bg-accent'
                    }`}
                    title={iconName}
                  >
                    <IconComponent size={16} />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity">
              <Plus size={16} />
              {initial ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={onCancel} className="flex items-center gap-1 px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors">
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
