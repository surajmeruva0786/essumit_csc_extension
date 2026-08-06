import { Card, CardContent } from '../components/ui/card'
import { Zap, Trash2 } from 'lucide-react'
import { useQuickActions } from '../context/QuickActionsContext'

export default function QuickActions() {
  const { actions, removeAction } = useQuickActions()

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Actions</h1>
        <p className="text-muted-foreground text-sm">One-tap shortcuts to frequently used actions</p>
      </div>
      {actions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Zap size={48} className="mx-auto mb-4 opacity-50" />
            <p>No quick actions configured yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{action.label}</p>
                </div>
                <button
                  onClick={() => removeAction(action.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
